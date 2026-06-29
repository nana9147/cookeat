import { supabaseAdmin } from '@/lib/supabaseAdmin';

const STATUS_LABEL: Record<string, string> = {
  대기: '정산대기',
  예정: '정산예정',
  완료: '정산완료',
};

function getWeekOfMonthLabel(periodStart: string): string {
  const date = new Date(periodStart);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const firstDayOfMonth = new Date(year, date.getMonth(), 1);
  const firstMonday = new Date(firstDayOfMonth);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const diffToFirstMonday =
    firstDayOfWeek === 0 ? 1 : firstDayOfWeek === 1 ? 0 : 8 - firstDayOfWeek;
  firstMonday.setDate(firstDayOfMonth.getDate() + diffToFirstMonday);

  const diffDays = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 1;

  return `${year}년 ${month}월 ${weekNumber}주차`;
}

export async function getSellerSettlementsForExport(
  sellerId: number,
  options: { status?: string; keyword?: string; settlementIds?: number[] }
) {
  const { status, keyword, settlementIds } = options;

  let settlementQuery = supabaseAdmin
    .from('settlements')
    .select('settlement_id, status, period_start, period_end, settled_at')
    .eq('seller_id', sellerId);

  if (settlementIds && settlementIds.length > 0) {
    settlementQuery = settlementQuery.in('settlement_id', settlementIds);
  } else if (status && status !== '전체') {
    settlementQuery = settlementQuery.eq('status', status);
  }

  const { data: allSettlements, error: settlementsError } = await settlementQuery.order(
    'period_start',
    { ascending: false }
  );

  if (settlementsError) throw settlementsError;
  if (!allSettlements || allSettlements.length === 0) return [];

  let settlements = allSettlements;
  if (!settlementIds && keyword) {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '');
    settlements = allSettlements.filter((s) => {
      const label = getWeekOfMonthLabel(s.period_start).toLowerCase().replace(/\s+/g, '');
      return (
        label.includes(normalizedKeyword) ||
        s.period_start.includes(keyword) ||
        s.period_end.includes(keyword)
      );
    });
  }

  if (settlements.length === 0) return [];

  const settlementIdsInScope = settlements.map((s) => s.settlement_id);

  const { data: settlementItems, error: itemsError } = await supabaseAdmin
    .from('settlement_items')
    .select('settlement_id, item_id, order_id, item_amount, item_fee')
    .in('settlement_id', settlementIdsInScope);

  if (itemsError) throw itemsError;

  const settlementItemIds = new Set((settlementItems ?? []).map((si) => si.item_id));

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;
  const sellerItemIdSet = new Set((sellerItemRows ?? []).map((i) => i.item_id));

  const cancelledBySettlementId = new Map<number, number[]>();
  for (const settlement of settlements) {
    const { data: cancelledHistory, error: cancelledError } = await supabaseAdmin
      .from('order_item_status_history')
      .select('order_item_id, status, changed_at')
      .in('status', ['취소', '환불'])
      .gte('changed_at', `${settlement.period_start}T00:00:00`)
      .lte('changed_at', `${settlement.period_end}T23:59:59`);

    if (cancelledError) throw cancelledError;

    const cancelledItemIds = (cancelledHistory ?? [])
      .filter(
        (c) => sellerItemIdSet.has(c.order_item_id) && !settlementItemIds.has(c.order_item_id)
      )
      .map((c) => c.order_item_id);

    cancelledBySettlementId.set(settlement.settlement_id, [...new Set(cancelledItemIds)]);
  }

  const allCancelledItemIds = [...cancelledBySettlementId.values()].flat();
  const allItemIds = [
    ...new Set([...(settlementItems ?? []).map((si) => si.item_id), ...allCancelledItemIds]),
  ];

  const { data: orderItems, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id, quantity, unit_price, products(name)')
    .in('item_id', allItemIds);

  if (orderItemsError) throw orderItemsError;

  const orderItemMap = new Map((orderItems ?? []).map((oi) => [oi.item_id, oi]));
  const settlementMap = new Map(settlements.map((s) => [s.settlement_id, s]));

  const confirmedRows = (settlementItems ?? []).map((si) => {
    const settlement = settlementMap.get(si.settlement_id);
    const orderItem = orderItemMap.get(si.item_id);
    const product = orderItem?.products as unknown as { name: string } | null;

    return {
      settlementId: si.settlement_id,
      periodLabel: settlement ? getWeekOfMonthLabel(settlement.period_start) : '',
      periodStart: settlement?.period_start ?? '',
      periodEnd: settlement?.period_end ?? '',
      orderId: si.order_id,
      productName: product?.name ?? '알 수 없음',
      quantity: orderItem?.quantity ?? 0,
      unitPrice: orderItem?.unit_price ?? 0,
      itemAmount: si.item_amount + si.item_fee,
      itemFee: si.item_fee,
      itemSettlementAmount: si.item_amount,
      itemStatus: '구매확정',
      status: settlement ? (STATUS_LABEL[settlement.status] ?? settlement.status) : '',
      settledAt: settlement?.settled_at ?? null,
    };
  });

  const cancelledRows = [...cancelledBySettlementId.entries()].flatMap(
    ([settlementId, itemIds]) => {
      const settlement = settlementMap.get(settlementId);
      return itemIds.map((itemId) => {
        const orderItem = orderItemMap.get(itemId);
        const product = orderItem?.products as unknown as { name: string } | null;
        const itemAmount = orderItem ? orderItem.quantity * orderItem.unit_price : 0;

        return {
          settlementId,
          periodLabel: settlement ? getWeekOfMonthLabel(settlement.period_start) : '',
          periodStart: settlement?.period_start ?? '',
          periodEnd: settlement?.period_end ?? '',
          orderId: orderItem?.order_id ?? '',
          productName: product?.name ?? '알 수 없음',
          quantity: orderItem?.quantity ?? 0,
          unitPrice: orderItem?.unit_price ?? 0,
          itemAmount,
          itemFee: 0,
          itemSettlementAmount: 0,
          itemStatus: '취소/환불',
          status: settlement ? (STATUS_LABEL[settlement.status] ?? settlement.status) : '',
          settledAt: settlement?.settled_at ?? null,
        };
      });
    }
  );

  const rows = [...confirmedRows, ...cancelledRows].sort((a, b) => a.settlementId - b.settlementId);

  return rows;
}

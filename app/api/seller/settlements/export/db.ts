import { supabaseAdmin } from '@/lib/supabaseAdmin';

const STATUS_LABEL: Record<string, string> = {
  대기: '정산대기',
  예정: '정산예정',
  완료: '정산완료',
};

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
  } else {
    if (status && status !== '전체') {
      settlementQuery = settlementQuery.eq('status', status);
    }
    if (keyword) {
      settlementQuery = settlementQuery.or(
        `period_start.ilike.%${keyword}%,period_end.ilike.%${keyword}%`
      );
    }
  }

  const { data: settlements, error: settlementsError } = await settlementQuery.order(
    'period_start',
    { ascending: false }
  );

  if (settlementsError) throw settlementsError;
  if (!settlements || settlements.length === 0) return [];

  const settlementIdsInScope = settlements.map((s) => s.settlement_id);

  const { data: settlementItems, error: itemsError } = await supabaseAdmin
    .from('settlement_items')
    .select('settlement_id, item_id, order_id, item_amount, item_fee')
    .in('settlement_id', settlementIdsInScope);

  if (itemsError) throw itemsError;

  const itemIds = (settlementItems ?? []).map((si) => si.item_id);

  const { data: orderItems, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, quantity, unit_price, products(name)')
    .in('item_id', itemIds);

  if (orderItemsError) throw orderItemsError;

  const orderItemMap = new Map((orderItems ?? []).map((oi) => [oi.item_id, oi]));

  const settlementMap = new Map(settlements.map((s) => [s.settlement_id, s]));

  const rows = (settlementItems ?? []).map((si) => {
    const settlement = settlementMap.get(si.settlement_id);
    const orderItem = orderItemMap.get(si.item_id);
    const product = orderItem?.products as unknown as { name: string } | null;

    return {
      settlementId: si.settlement_id,
      periodStart: settlement?.period_start ?? '',
      periodEnd: settlement?.period_end ?? '',
      orderId: si.order_id,
      productName: product?.name ?? '알 수 없음',
      quantity: orderItem?.quantity ?? 0,
      unitPrice: orderItem?.unit_price ?? 0,
      itemAmount: si.item_amount + si.item_fee,
      itemFee: si.item_fee,
      itemSettlementAmount: si.item_amount,
      status: settlement ? (STATUS_LABEL[settlement.status] ?? settlement.status) : '',
      settledAt: settlement?.settled_at ?? null,
    };
  });

  return rows;
}

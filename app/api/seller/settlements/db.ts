import { supabaseAdmin } from '@/lib/supabaseAdmin';

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, days: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

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

export async function ensureSettlements(sellerId: number) {
  const now = new Date();

  const { data: duePending, error: dueError } = await supabaseAdmin
    .from('settlements')
    .select('settlement_id, period_end')
    .eq('seller_id', sellerId)
    .eq('status', '예정');

  if (dueError) throw dueError;

  for (const s of duePending ?? []) {
    const settlementDate = addDays(new Date(s.period_end), 3);
    if (now >= settlementDate) {
      const { error: updateError } = await supabaseAdmin
        .from('settlements')
        .update({ status: '완료', settled_at: settlementDate.toISOString() })
        .eq('settlement_id', s.settlement_id);

      if (updateError) throw updateError;
    }
  }

  const { data: seller, error: sellerError } = await supabaseAdmin
    .from('sellers')
    .select('commission_rate')
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (sellerError) throw sellerError;
  if (!seller) return;

  const feeRate = seller.commission_rate / 100;

  interface SellerOrderItem {
    item_id: number;
    order_id: string;
    quantity: number;
    unit_price: number;
  }

  const { data: sellerItems, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id, quantity, unit_price')
    .eq('seller_id', sellerId)
    .returns<SellerOrderItem[]>();

  if (sellerItemsError) throw sellerItemsError;
  if (!sellerItems || sellerItems.length === 0) return;

  const { data: existingSettlements, error: settlementsError } = await supabaseAdmin
    .from('settlements')
    .select('settlement_id, period_start, period_end, status')
    .eq('seller_id', sellerId);

  if (settlementsError) throw settlementsError;

  const completedPeriods = new Set(
    (existingSettlements ?? [])
      .filter((s) => s.status === '완료')
      .map((s) => `${s.period_start}_${s.period_end}`)
  );

  const existingNonCompletedByPeriod = new Map(
    (existingSettlements ?? [])
      .filter((s) => s.status !== '완료')
      .map((s) => [`${s.period_start}_${s.period_end}`, s.settlement_id])
  );

  const { data: confirmedItemStatuses, error: confirmedError } = await supabaseAdmin
    .from('order_item_status_history')
    .select('order_item_id, changed_at')
    .eq('status', '구매확정')
    .in(
      'order_item_id',
      sellerItems.map((i) => i.item_id)
    )
    .order('changed_at', { ascending: false });

  if (confirmedError) throw confirmedError;

  const confirmedAtByItemId = new Map<number, string>();
  for (const c of confirmedItemStatuses ?? []) {
    if (!confirmedAtByItemId.has(c.order_item_id)) {
      confirmedAtByItemId.set(c.order_item_id, c.changed_at);
    }
  }

  const itemsByOrderId = new Map<string, SellerOrderItem[]>();
  for (const item of sellerItems) {
    if (!itemsByOrderId.has(item.order_id)) {
      itemsByOrderId.set(item.order_id, []);
    }
    itemsByOrderId.get(item.order_id)!.push(item);
  }

  const totalByWeek = new Map<string, number>();
  const weekToOrderItems = new Map<
    string,
    { itemId: number; orderId: string; amount: number; fee: number }[]
  >();

  for (const item of sellerItems) {
    const confirmedAt = confirmedAtByItemId.get(item.item_id);
    if (!confirmedAt) continue;

    const { start, end } = getWeekRange(new Date(confirmedAt));
    const key = `${toDateStr(start)}_${toDateStr(end)}`;

    const itemAmount = item.quantity * item.unit_price;
    const itemFee = Math.round(itemAmount * feeRate);

    totalByWeek.set(key, (totalByWeek.get(key) ?? 0) + itemAmount);

    if (!weekToOrderItems.has(key)) {
      weekToOrderItems.set(key, []);
    }
    weekToOrderItems.get(key)!.push({
      itemId: item.item_id,
      orderId: item.order_id,
      amount: itemAmount - itemFee,
      fee: itemFee,
    });
  }

  const currentWeek = getWeekRange(now);
  const currentWeekKey = `${toDateStr(currentWeek.start)}_${toDateStr(currentWeek.end)}`;

  for (const [key, totalAmount] of totalByWeek.entries()) {
    if (completedPeriods.has(key)) continue;

    const [startStr, endStr] = key.split('_');
    const fee = Math.round(totalAmount * feeRate);
    const amount = totalAmount - fee;

    const isCurrentWeek = key === currentWeekKey;

    let settlementPayload: {
      seller_id: number;
      amount: number;
      fee: number;
      status: string;
      period_start: string;
      period_end: string;
      settled_at: string | null;
    };

    if (isCurrentWeek) {
      settlementPayload = {
        seller_id: sellerId,
        amount,
        fee,
        status: '대기',
        period_start: startStr,
        period_end: endStr,
        settled_at: null,
      };
    } else {
      const periodEndDate = new Date(endStr);
      const settlementDate = addDays(periodEndDate, 3);
      const isSettlementDue = now >= settlementDate;

      settlementPayload = {
        seller_id: sellerId,
        amount,
        fee,
        status: isSettlementDue ? '완료' : '예정',
        period_start: startStr,
        period_end: endStr,
        settled_at: isSettlementDue ? settlementDate.toISOString() : null,
      };
    }

    const existingSettlementId = existingNonCompletedByPeriod.get(key);
    let settlementId: number;

    if (existingSettlementId) {
      const { error: updateError } = await supabaseAdmin
        .from('settlements')
        .update(settlementPayload)
        .eq('settlement_id', existingSettlementId);

      if (updateError) throw updateError;
      settlementId = existingSettlementId;

      const { error: deleteItemsError } = await supabaseAdmin
        .from('settlement_items')
        .delete()
        .eq('settlement_id', settlementId);

      if (deleteItemsError) throw deleteItemsError;
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('settlements')
        .insert(settlementPayload)
        .select('settlement_id')
        .single();

      if (insertError) {
        if (insertError.code === '23505') continue;
        throw insertError;
      }
      settlementId = inserted.settlement_id;
    }

    const weekItems = weekToOrderItems.get(key) ?? [];
    if (weekItems.length > 0) {
      const { error: itemsInsertError } = await supabaseAdmin.from('settlement_items').insert(
        weekItems.map((wi) => ({
          settlement_id: settlementId,
          item_id: wi.itemId,
          order_id: wi.orderId,
          item_amount: wi.amount,
          item_fee: wi.fee,
        }))
      );

      if (itemsInsertError) throw itemsInsertError;
    }
  }
}

type DbSettlement = {
  settlement_id: number;
  seller_id: number;
  period_start: string;
  period_end: string;
  amount: number;
  fee: number;
  status: string;
  settled_at: string | null;
};

export async function getSellerSettlements(
  sellerId: number,
  options: { page: number; limit: number; status?: string; keyword?: string }
) {
  const { page, limit, status, keyword } = options;
  const rangeFrom = (page - 1) * limit;

  let query = supabaseAdmin.from('settlements').select('*').eq('seller_id', sellerId);
  if (status && status !== '전체') {
    query = query.eq('status', status);
  }

  let settlements: DbSettlement[];
  let total: number;

  if (keyword) {
    // getWeekOfMonthLabel은 JS 함수이므로 DB 레벨 필터 불가 — 인메모리 필터 사용
    // 정산 레코드는 주당 1건으로 수가 제한되므로 전체 조회 부담 없음
    const { data: all, error } = await query.order('period_start', { ascending: false });
    if (error) throw error;
    if (!all || all.length === 0) return { settlements: [], total: 0 };

    const norm = keyword.toLowerCase().replace(/\s+/g, '');
    const filtered = (all as DbSettlement[]).filter((s) => {
      const label = getWeekOfMonthLabel(s.period_start).toLowerCase().replace(/\s+/g, '');
      return (
        label.includes(norm) || s.period_start.includes(keyword) || s.period_end.includes(keyword)
      );
    });

    total = filtered.length;
    settlements = filtered.slice(rangeFrom, rangeFrom + limit);
  } else {
    let countQ = supabaseAdmin
      .from('settlements')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId);
    if (status && status !== '전체') countQ = countQ.eq('status', status);

    const { count, error: countError } = await countQ;
    if (countError) throw countError;

    const { data, error } = await query
      .order('period_start', { ascending: false })
      .range(rangeFrom, rangeFrom + limit - 1);
    if (error) throw error;

    total = count ?? 0;
    settlements = (data ?? []) as DbSettlement[];
  }

  if (settlements.length === 0) {
    return { settlements: [], total };
  }

  const settlementIds = settlements.map((s) => s.settlement_id);

  const { data: settlementItems, error: itemsError } = await supabaseAdmin
    .from('settlement_items')
    .select('settlement_id, item_id')
    .in('settlement_id', settlementIds);

  if (itemsError) throw itemsError;

  const settlementItemIdsBySettlement = new Map<number, Set<number>>();
  for (const si of settlementItems ?? []) {
    if (!settlementItemIdsBySettlement.has(si.settlement_id)) {
      settlementItemIdsBySettlement.set(si.settlement_id, new Set());
    }
    settlementItemIdsBySettlement.get(si.settlement_id)!.add(si.item_id);
  }

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, quantity, unit_price')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;
  const orderItemMap = new Map((sellerItemRows ?? []).map((i) => [i.item_id, i]));

  const cancelledAmountBySettlement = new Map<number, number>();

  if (settlements.length > 0) {
    const minPeriodStart = settlements.reduce(
      (min, s) => (s.period_start < min ? s.period_start : min),
      settlements[0].period_start
    );
    const maxPeriodEnd = settlements.reduce(
      (max, s) => (s.period_end > max ? s.period_end : max),
      settlements[0].period_end
    );

    const { data: allCancelledHistory, error: allCancelledError } = await supabaseAdmin
      .from('order_item_status_history')
      .select('order_item_id, status, changed_at')
      .in('status', ['취소', '환불'])
      .gte('changed_at', `${minPeriodStart}T00:00:00`)
      .lte('changed_at', `${maxPeriodEnd}T23:59:59`);

    if (allCancelledError) throw allCancelledError;

    for (const settlement of settlements) {
      const settlementItemIds =
        settlementItemIdsBySettlement.get(settlement.settlement_id) ?? new Set();

      const cancelledItemIds = [
        ...new Set(
          (allCancelledHistory ?? [])
            .filter(
              (c) =>
                c.changed_at >= `${settlement.period_start}T00:00:00` &&
                c.changed_at <= `${settlement.period_end}T23:59:59` &&
                orderItemMap.has(c.order_item_id) &&
                !settlementItemIds.has(c.order_item_id)
            )
            .map((c) => c.order_item_id)
        ),
      ];

      const cancelledAmount = cancelledItemIds.reduce((sum, itemId) => {
        const item = orderItemMap.get(itemId);
        return sum + (item ? item.quantity * item.unit_price : 0);
      }, 0);

      cancelledAmountBySettlement.set(settlement.settlement_id, cancelledAmount);
    }
  }

  const rows = settlements.map((s) => {
    const cancelledAmount = cancelledAmountBySettlement.get(s.settlement_id) ?? 0;
    const confirmedSalesAmount = s.amount + s.fee;

    const displaySettledAt =
      s.settled_at ??
      (s.status === '예정' ? addDays(new Date(s.period_end), 3).toISOString() : null);

    return {
      settlementId: s.settlement_id,
      periodLabel: getWeekOfMonthLabel(s.period_start),
      totalAmount: confirmedSalesAmount + cancelledAmount,
      cancelledAmount,
      fee: s.fee,
      amount: s.amount,
      status: STATUS_LABEL[s.status] ?? s.status,
      periodStart: s.period_start,
      periodEnd: s.period_end,
      settledAt: displaySettledAt,
    };
  });

  return { settlements: rows, total };
}

export async function getSellerSettlementSummary(sellerId: number) {
  const { data: settlements, error } = await supabaseAdmin
    .from('settlements')
    .select('amount, status, period_end')
    .eq('seller_id', sellerId);

  if (error) throw error;

  let completedTotal = 0;
  let scheduledTotal = 0;
  let pendingTotal = 0;
  let nextSettlementDate: string | null = null;

  for (const s of settlements ?? []) {
    if (s.status === '완료') {
      completedTotal += s.amount;
    } else if (s.status === '예정') {
      scheduledTotal += s.amount;
      const settlementDate = addDays(new Date(s.period_end), 3);
      const dateStr = toDateStr(settlementDate);
      if (!nextSettlementDate || dateStr < nextSettlementDate) {
        nextSettlementDate = dateStr;
      }
    } else if (s.status === '대기') {
      pendingTotal += s.amount;
    }
  }

  return {
    completedTotal,
    scheduledTotal,
    pendingTotal,
    nextSettlementDate,
  };
}

export async function getSellerSettlementDetail(sellerId: number, settlementId: number) {
  const { data: settlement, error: settlementError } = await supabaseAdmin
    .from('settlements')
    .select('*')
    .eq('settlement_id', settlementId)
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (settlementError) throw settlementError;
  if (!settlement) return null;

  const { data: seller, error: sellerError } = await supabaseAdmin
    .from('sellers')
    .select('commission_rate, bank_name, bank_account, store_name, representative_name')
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (sellerError) throw sellerError;

  const { data: settlementItems, error: itemsError } = await supabaseAdmin
    .from('settlement_items')
    .select('item_id, order_id, item_amount, item_fee')
    .eq('settlement_id', settlementId);

  if (itemsError) throw itemsError;

  const settlementItemIds = new Set((settlementItems ?? []).map((si) => si.item_id));

  const { data: cancelledHistory, error: cancelledError } = await supabaseAdmin
    .from('order_item_status_history')
    .select('order_item_id, status, changed_at')
    .in('status', ['취소', '환불'])
    .gte('changed_at', `${settlement.period_start}T00:00:00`)
    .lte('changed_at', `${settlement.period_end}T23:59:59`);

  if (cancelledError) throw cancelledError;

  const sellerItemIds = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);

  const sellerItemIdSet = new Set((sellerItemIds.data ?? []).map((i) => i.item_id));

  const cancelledItemIds = (cancelledHistory ?? [])
    .filter((c) => sellerItemIdSet.has(c.order_item_id) && !settlementItemIds.has(c.order_item_id))
    .map((c) => c.order_item_id);

  const allItemIds = [...settlementItemIds, ...new Set(cancelledItemIds)];

  const { data: orderItems, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id, quantity, unit_price, shipping_status, products(name)')
    .in('item_id', allItemIds);

  if (orderItemsError) throw orderItemsError;

  const orderItemMap = new Map((orderItems ?? []).map((oi) => [oi.item_id, oi]));

  const orderIds = [...new Set((orderItems ?? []).map((oi) => oi.order_id))];

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, created_at')
    .in('order_id', orderIds);

  if (ordersError) throw ordersError;

  const orderDateMap = new Map((orders ?? []).map((o) => [o.order_id, o.created_at]));

  const cancelledStatusByItemId = new Map(
    (cancelledHistory ?? []).map((c) => [c.order_item_id, c.status])
  );

  const confirmedSalesAmount = (settlementItems ?? []).reduce(
    (sum, si) => sum + si.item_amount + si.item_fee,
    0
  );

  const cancelledSalesAmount = [...new Set(cancelledItemIds)].reduce((sum, itemId) => {
    const orderItem = orderItemMap.get(itemId);
    return sum + (orderItem ? orderItem.quantity * orderItem.unit_price : 0);
  }, 0);

  const totalSalesAmount = confirmedSalesAmount + cancelledSalesAmount;
  const totalFee = settlement.fee;

  const confirmedOrders = (settlementItems ?? []).map((si) => {
    const orderItem = orderItemMap.get(si.item_id);
    const product = orderItem?.products as unknown as { name: string } | null;

    return {
      orderId: si.order_id,
      productName: product?.name ?? '알 수 없음',
      orderDate: orderDateMap.get(si.order_id) ?? '',
      salesAmount: si.item_amount + si.item_fee,
      commission: si.item_fee,
      settlementAmount: si.item_amount,
      status: '구매확정',
    };
  });

  const cancelledOrders = [...new Set(cancelledItemIds)].map((itemId) => {
    const orderItem = orderItemMap.get(itemId);
    const product = orderItem?.products as unknown as { name: string } | null;
    const status = cancelledStatusByItemId.get(itemId) ?? '취소';

    return {
      orderId: orderItem?.order_id ?? '',
      productName: product?.name ?? '알 수 없음',
      orderDate: orderDateMap.get(orderItem?.order_id ?? '') ?? '',
      salesAmount: orderItem ? orderItem.quantity * orderItem.unit_price : 0,
      commission: 0,
      settlementAmount: 0,
      status,
    };
  });

  const settlementOrders = [...confirmedOrders, ...cancelledOrders].sort(
    (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
  );

  return {
    id: String(settlement.settlement_id),
    period: getWeekOfMonthLabel(settlement.period_start),
    periodRange: `${settlement.period_start.slice(5).replace('-', '.')} - ${settlement.period_end.slice(5).replace('-', '.')}`,
    settlementDate: settlement.settled_at
      ? settlement.settled_at.split('T')[0]
      : settlement.status === '예정'
        ? toDateStr(addDays(new Date(settlement.period_end), 3))
        : '',
    status: STATUS_LABEL[settlement.status] ?? settlement.status,
    paymentMethod: '계좌 이체',
    amountDetail: {
      totalSalesAmount,
      commissionRate: seller?.commission_rate ?? 0,
      commission: totalFee,
      refundAmount: cancelledSalesAmount,
      finalAmount: settlement.amount,
    },
    bankInfo: {
      bankName: seller?.bank_name ?? '',
      accountNumber: seller?.bank_account ?? '',
      accountHolder: seller?.representative_name ?? seller?.store_name ?? '',
    },
    orders: settlementOrders,
  };
}

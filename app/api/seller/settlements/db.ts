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

export async function getSellerSettlements(
  sellerId: number,
  options: { page: number; limit: number; status?: string; keyword?: string }
) {
  await ensureSettlements(sellerId);

  const { page, limit, status, keyword } = options;

  let query = supabaseAdmin
    .from('settlements')
    .select('*', { count: 'exact' })
    .eq('seller_id', sellerId);

  if (status && status !== '전체') {
    query = query.eq('status', status);
  }

  if (keyword) {
    query = query.or(`period_start.ilike.%${keyword}%,period_end.ilike.%${keyword}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: settlements,
    count,
    error,
  } = await query.order('period_start', { ascending: false }).range(from, to);

  if (error) throw error;

  const STATUS_LABEL: Record<string, string> = {
    대기: '정산대기',
    예정: '정산예정',
    완료: '정산완료',
  };

  const rows = (settlements ?? []).map((s) => ({
    settlementId: s.settlement_id,
    totalAmount: s.amount + s.fee,
    fee: s.fee,
    amount: s.amount,
    status: STATUS_LABEL[s.status] ?? s.status,
    periodStart: s.period_start,
    periodEnd: s.period_end,
    settledAt: s.settled_at,
  }));

  return { settlements: rows, total: count ?? 0 };
}

export async function getSellerSettlementSummary(sellerId: number) {
  await ensureSettlements(sellerId);

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

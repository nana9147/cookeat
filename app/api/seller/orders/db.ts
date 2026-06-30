import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getSellerOrders(
  sellerId: number,
  options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const { page, limit, keyword, status, startDate, endDate, sortBy, sortOrder = 'desc' } = options;
  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  // Keyword spans multiple tables — pre-fetch matching order IDs
  let keywordOrderIds: string[] | null = null;
  if (keyword) {
    const { data: userRows } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .ilike('nickname', `%${keyword}%`);
    const matchedUserIds = (userRows ?? []).map((u) => u.user_id);

    const orParts = [
      `order_id.ilike.%${keyword}%`,
      `recipient.ilike.%${keyword}%`,
      `phone.ilike.%${keyword}%`,
    ];
    if (matchedUserIds.length > 0) {
      orParts.push(`user_id.in.(${matchedUserIds.join(',')})`);
    }

    const { data: orderRows } = await supabaseAdmin
      .from('orders')
      .select('order_id')
      .or(orParts.join(','));

    keywordOrderIds = (orderRows ?? []).map((o) => o.order_id);
    if (keywordOrderIds.length === 0) {
      return { orders: [], total: 0 };
    }
  }

  let query = supabaseAdmin
    .from('order_items')
    .select(
      `item_id, order_id, quantity, unit_price,
       products(name),
       orders!inner(created_at, status, recipient, phone, users(nickname))`,
      { count: 'exact' }
    )
    .eq('seller_id', sellerId);

  if (status && status !== '전체') query = query.eq('orders.status', status);
  if (startDate) query = query.gte('orders.created_at', `${startDate}T00:00:00`);
  if (endDate) query = query.lte('orders.created_at', `${endDate}T23:59:59`);
  if (keywordOrderIds !== null) query = query.in('order_id', keywordOrderIds);

  if (sortBy === 'orderId') {
    query = query.order('order_id', { ascending: sortOrder === 'asc' });
  } else {
    query = query.order('created_at', {
      referencedTable: 'orders',
      ascending: sortOrder === 'asc',
    });
  }
  query = query.range(rangeFrom, rangeTo);

  const { data, count, error } = await query;
  if (error) throw error;

  // Fetch refunds only for this page's items
  const itemIds = (data ?? []).map((row) => row.item_id);
  const latestRefundByItem = new Map<number, { status: string; rejectReason: string | null }>();

  if (itemIds.length > 0) {
    const { data: refunds, error: refundsError } = await supabaseAdmin
      .from('refund_requests')
      .select('item_id, status, reject_reason')
      .in('item_id', itemIds)
      .order('requested_at', { ascending: false });

    if (refundsError) throw refundsError;

    for (const r of refunds ?? []) {
      if (!latestRefundByItem.has(r.item_id)) {
        latestRefundByItem.set(r.item_id, { status: r.status, rejectReason: r.reject_reason });
      }
    }
  }

  const orders = (data ?? []).map((item) => {
    const order = item.orders as unknown as {
      created_at: string;
      status: string;
      recipient: string;
      phone: string;
      users: { nickname: string } | null;
    };
    const product = item.products as unknown as { name: string } | null;
    const refund = latestRefundByItem.get(item.item_id);
    const hasActiveClaim = Boolean(refund && !refund.rejectReason);

    return {
      orderId: item.order_id,
      orderDate: order.created_at,
      customer: order.users?.nickname ?? '알 수 없음',
      recipient: order.recipient,
      phone: order.phone,
      itemId: item.item_id,
      productName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      itemTotalPrice: item.quantity * item.unit_price,
      status: order.status,
      hasActiveClaim,
    };
  });

  return { orders, total: count ?? 0 };
}

export async function getSellerOrderCounts(
  sellerId: number,
  options?: { startDate?: string; endDate?: string }
) {
  const { startDate, endDate } = options ?? {};

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerOrderIds = [...new Set((sellerItemRows ?? []).map((r) => r.order_id))];

  const emptyCounts = {
    전체: 0,
    결제완료: 0,
    배송준비: 0,
    배송중: 0,
    배송완료: 0,
  };

  if (sellerOrderIds.length === 0) {
    return emptyCounts;
  }

  let orderQuery = supabaseAdmin
    .from('orders')
    .select('order_id, status')
    .in('order_id', sellerOrderIds);

  if (startDate) orderQuery = orderQuery.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) orderQuery = orderQuery.lte('created_at', `${endDate}T23:59:59`);

  const { data: orders, error: ordersError } = await orderQuery;
  if (ordersError) throw ordersError;

  const counts = { ...emptyCounts };
  counts.전체 = (orders ?? []).length;

  for (const order of orders ?? []) {
    const status = order.status as keyof typeof counts;
    if (status in counts) {
      counts[status] += 1;
    }
  }

  return counts;
}

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
  const { page, limit, keyword, status, startDate, endDate, sortBy, sortOrder } = options;

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerItemIds = (sellerItemRows ?? []).map((r) => r.item_id);
  const sellerOrderIds = [...new Set((sellerItemRows ?? []).map((r) => r.order_id))];

  if (sellerItemIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let matchedUserIds: number[] = [];
  if (keyword) {
    const { data: userRows } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .ilike('nickname', `%${keyword}%`);
    matchedUserIds = (userRows ?? []).map((u) => u.user_id);
  }

  let orderQuery = supabaseAdmin
    .from('orders')
    .select('order_id, created_at, status, recipient, phone, user_id, users(nickname)')
    .in('order_id', sellerOrderIds);

  if (keyword) {
    const orConditions = [
      `order_id.ilike.%${keyword}%`,
      `recipient.ilike.%${keyword}%`,
      `phone.ilike.%${keyword}%`,
    ];
    if (matchedUserIds.length > 0) {
      orConditions.push(`user_id.in.(${matchedUserIds.join(',')})`);
    }
    orderQuery = orderQuery.or(orConditions.join(','));
  }
  if (startDate) orderQuery = orderQuery.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) orderQuery = orderQuery.lte('created_at', `${endDate}T23:59:59`);

  const { data: matchedOrders, error: matchedOrdersError } = await orderQuery;
  if (matchedOrdersError) throw matchedOrdersError;

  const matchedOrderIds = (matchedOrders ?? []).map((o) => o.order_id);
  if (matchedOrderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id, quantity, unit_price, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', matchedOrderIds);

  if (itemsError) throw itemsError;

  const itemIdsInScope = (items ?? []).map((i) => i.item_id);
  const { data: refunds, error: refundsError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id, status, reject_reason')
    .in('item_id', itemIdsInScope)
    .order('requested_at', { ascending: false });

  if (refundsError) throw refundsError;

  const latestRefundByItem = new Map<number, { status: string; rejectReason: string | null }>();
  for (const r of refunds ?? []) {
    if (!latestRefundByItem.has(r.item_id)) {
      latestRefundByItem.set(r.item_id, { status: r.status, rejectReason: r.reject_reason });
    }
  }

  let rows = (items ?? []).map((item) => {
    const order = (matchedOrders ?? []).find((o) => o.order_id === item.order_id);
    const user = order?.users as unknown as { nickname: string } | null;
    const product = item.products as unknown as { name: string } | null;
    const refund = latestRefundByItem.get(item.item_id);

    const itemStatus =
      refund && !refund.rejectReason ? refund.status : (order?.status ?? '결제완료');

    return {
      orderId: item.order_id,
      orderDate: order?.created_at ?? '',
      customer: user?.nickname ?? '알 수 없음',
      recipient: order?.recipient ?? '',
      phone: order?.phone ?? '',
      itemId: item.item_id,
      productName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      itemTotalPrice: item.quantity * item.unit_price,
      status: itemStatus,
    };
  });

  if (status && status !== '전체') {
    if (status === '취소환불') {
      rows = rows.filter(
        (r) => r.status === '취소' || r.status === '환불' || r.status === '환불요청'
      );
    } else {
      rows = rows.filter((r) => r.status === status);
    }
  }

  if (sortBy === 'orderDate') {
    const orderDateMap = new Map<string, string>();

    for (const row of rows) {
      if (!orderDateMap.has(row.orderId)) {
        orderDateMap.set(row.orderId, row.orderDate);
      }
    }

    const sortedOrderIds = [...orderDateMap.keys()].sort((a, b) => {
      const aTime = new Date(orderDateMap.get(a)!).getTime();
      const bTime = new Date(orderDateMap.get(b)!).getTime();

      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });

    const orderIndexMap = new Map(sortedOrderIds.map((id, index) => [id, index]));

    rows.sort((a, b) => orderIndexMap.get(a.orderId)! - orderIndexMap.get(b.orderId)!);
  }

  if (sortBy === 'orderId') {
    const sortedOrderIds = [...new Set(rows.map((r) => r.orderId))].sort((a, b) =>
      sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );

    const orderIndexMap = new Map(sortedOrderIds.map((id, index) => [id, index]));

    rows.sort((a, b) => orderIndexMap.get(a.orderId)! - orderIndexMap.get(b.orderId)!);
  }

  const total = rows.length;
  const from = (page - 1) * limit;
  const paged = rows.slice(from, from + limit);

  return { orders: paged, total };
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
    결제완료: 0,
    배송준비: 0,
    배송중: 0,
    배송완료: 0,
    취소: 0,
    취소요청: 0,
    환불: 0,
    환불요청: 0,
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

  const orderStatusMap = new Map((orders ?? []).map((o) => [o.order_id, o.status]));
  const inScopeOrderIds = new Set(orderStatusMap.keys());

  const itemsInScope = (sellerItemRows ?? []).filter((i) => inScopeOrderIds.has(i.order_id));
  const itemIds = itemsInScope.map((i) => i.item_id);

  if (itemIds.length === 0) {
    return emptyCounts;
  }

  const { data: refunds, error: refundsError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id, status, reject_reason')
    .in('item_id', itemIds)
    .order('requested_at', { ascending: false });

  if (refundsError) throw refundsError;

  const latestRefundByItem = new Map<number, { status: string; rejectReason: string | null }>();
  for (const r of refunds ?? []) {
    if (!latestRefundByItem.has(r.item_id)) {
      latestRefundByItem.set(r.item_id, { status: r.status, rejectReason: r.reject_reason });
    }
  }

  const counts = { ...emptyCounts };
  for (const item of itemsInScope) {
    const refund = latestRefundByItem.get(item.item_id);
    const orderStatus = orderStatusMap.get(item.order_id) as keyof typeof counts;

    const finalStatus =
      refund && !refund.rejectReason ? (refund.status as keyof typeof counts) : orderStatus;

    if (finalStatus in counts) {
      counts[finalStatus] += 1;
    }
  }

  return counts;
}

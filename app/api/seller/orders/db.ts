import { supabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_SORT_COLUMNS: Record<string, string> = {
  orderDate: 'created_at',
  price: 'final_amount',
};

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

  const { data: orderItemRows, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (orderItemsError) throw orderItemsError;

  const orderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];

  if (orderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let matchedUserIds: number[] = [];
  if (keyword) {
    const { data: userRows, error: userError } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .ilike('nickname', `%${keyword}%`);

    if (userError) throw userError;
    matchedUserIds = (userRows ?? []).map((u) => u.user_id);
  }

  let query = supabaseAdmin
    .from('orders')
    .select('order_id, created_at, status, recipient, phone, final_amount, users(nickname)', {
      count: 'exact',
    })
    .in('order_id', orderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료', '취소', '환불']);

  if (status && status !== '전체') {
    if (status === '취소환불') {
      query = query.in('status', ['취소', '환불']);
    } else {
      query = query.eq('status', status);
    }
  }

  if (keyword) {
    const orConditions = [
      `order_id.ilike.%${keyword}%`,
      `recipient.ilike.%${keyword}%`,
      `phone.ilike.%${keyword}%`,
    ];
    if (matchedUserIds.length > 0) {
      orConditions.push(`user_id.in.(${matchedUserIds.join(',')})`);
    }
    query = query.or(orConditions.join(','));
  }

  if (startDate) {
    query = query.gte('created_at', `${startDate}T00:00:00`);
  }
  if (endDate) {
    query = query.lte('created_at', `${endDate}T23:59:59`);
  }

  const sortColumn = VALID_SORT_COLUMNS[sortBy ?? 'orderDate'] ?? 'created_at';
  const ascending = sortOrder === 'asc';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: orders,
    count,
    error: ordersError,
  } = await query.order(sortColumn, { ascending }).range(from, to);

  if (ordersError) throw ordersError;

  const pagedOrderIds = (orders ?? []).map((o) => o.order_id);

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (itemsError) throw itemsError;

  const result = (orders ?? []).map((o) => {
    const productNames = (items ?? [])
      .filter((i) => i.order_id === o.order_id)
      .map((i) => (i.products as unknown as { name: string } | null)?.name)
      .filter((name): name is string => Boolean(name));

    const product =
      productNames.length === 0
        ? ''
        : productNames.length === 1
          ? productNames[0]
          : `${productNames[0]} 외 ${productNames.length - 1}건`;

    const user = o.users as unknown as { nickname: string } | null;

    return {
      id: o.order_id,
      customer: user?.nickname ?? '알 수 없음',
      recipient: o.recipient ?? '',
      phone: o.phone ?? '',
      product,
      price: o.final_amount ?? 0,
      status: o.status,
      orderDate: o.created_at,
    };
  });

  return { orders: result, total: count ?? 0 };
}

export async function getSellerOrderCounts(
  sellerId: number,
  options?: { startDate?: string; endDate?: string }
) {
  const { startDate, endDate } = options ?? {};

  const { data: orderItemRows, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (orderItemsError) throw orderItemsError;

  const orderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];

  const emptyCounts = {
    결제완료: 0,
    배송준비: 0,
    배송중: 0,
    배송완료: 0,
    취소: 0,
    환불: 0,
  };

  if (orderIds.length === 0) {
    return emptyCounts;
  }

  let query = supabaseAdmin
    .from('orders')
    .select('status')
    .in('order_id', orderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료', '취소', '환불']);

  if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

  const { data, error } = await query;

  if (error) throw error;

  const counts = { ...emptyCounts };
  for (const row of data ?? []) {
    counts[row.status as keyof typeof counts] += 1;
  }

  return counts;
}

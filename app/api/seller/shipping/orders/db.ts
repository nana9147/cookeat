import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getSellerShippingOrders(
  sellerId: number,
  options: { page: number; limit: number; keyword?: string; status?: string }
) {
  const { page, limit, keyword, status } = options;

  const { data: orderItemRows, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (orderItemsError) throw orderItemsError;

  const orderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];

  if (orderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let query = supabaseAdmin
    .from('orders')
    .select('order_id, created_at, status, users(nickname)', { count: 'exact' })
    .in('order_id', orderIds)
    .in('status', ['주문확인', '배송준비', '배송중', '배송완료']);

  if (status) {
    query = query.eq('status', status);
  }

  if (keyword) {
    query = query.ilike('order_id', `%${keyword}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: orders,
    count,
    error: ordersError,
  } = await query.order('created_at', { ascending: false }).range(from, to);

  if (ordersError) throw ordersError;

  const pagedOrderIds = (orders ?? []).map((o) => o.order_id);

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (itemsError) throw itemsError;

  const { data: shippings, error: shippingsError } = await supabaseAdmin
    .from('shippings')
    .select('order_id, carrier, tracking_number')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (shippingsError) throw shippingsError;

  const result = (orders ?? []).map((o) => {
    const products = (items ?? [])
      .filter((i) => i.order_id === o.order_id)
      .map((i) => (i.products as unknown as { name: string } | null)?.name)
      .filter((name): name is string => Boolean(name));

    const shipping = (shippings ?? []).find((s) => s.order_id === o.order_id);
    const user = o.users as unknown as { nickname: string } | null;

    return {
      id: o.order_id,
      customer: user?.nickname ?? '알 수 없음',
      products,
      orderDate: o.created_at,
      status: o.status,
      courier: shipping?.carrier ?? '',
      trackingNumber: shipping?.tracking_number ?? '',
    };
  });

  return { orders: result, total: count ?? 0 };
}

export async function getSellerShippingOrderCounts(sellerId: number) {
  const { data: orderItemRows, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (orderItemsError) throw orderItemsError;

  const orderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];

  if (orderIds.length === 0) {
    return { 주문확인: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('status')
    .in('order_id', orderIds)
    .in('status', ['주문확인', '배송준비', '배송중', '배송완료']);

  if (error) throw error;

  const counts = { 주문확인: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 };
  for (const row of data ?? []) {
    counts[row.status as keyof typeof counts] += 1;
  }

  return counts;
}

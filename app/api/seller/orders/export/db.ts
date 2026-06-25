import { supabaseAdmin } from '@/lib/supabaseAdmin';

const MAX_EXPORT_BATCH_SIZE = 1000;

export async function getSellerOrdersForExport(
  sellerId: number,
  options: {
    offset: number;
    limit: number;
    orderIds?: string[];
    status?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }
) {
  const { offset, status, startDate, endDate, keyword } = options;
  const limit = Math.min(options.limit, MAX_EXPORT_BATCH_SIZE);

  const { data: orderItemRows, error: orderItemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('seller_id', sellerId);

  if (orderItemsError) throw orderItemsError;

  const sellerOrderIds = [...new Set((orderItemRows ?? []).map((r) => r.order_id))];

  if (sellerOrderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  const targetOrderIds = options.orderIds
    ? options.orderIds.filter((id) => sellerOrderIds.includes(id))
    : sellerOrderIds;

  if (targetOrderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let userMatchedIds: number[] = [];
  if (keyword) {
    const { data: userRows, error: userError } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .ilike('nickname', `%${keyword}%`);
    if (userError) throw userError;
    userMatchedIds = (userRows ?? []).map((u) => u.user_id);
  }

  let query = supabaseAdmin
    .from('orders')
    .select(
      'order_id, created_at, status, recipient, phone, address, address_detail, shipping_request, total_amount, shipping_fee, coupon_discount, used_point, final_amount, payment_method, users(nickname)',
      { count: 'exact' }
    )
    .in('order_id', targetOrderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료', '취소', '환불']);

  if (status && status !== '전체') {
    query =
      status === '취소환불' ? query.in('status', ['취소', '환불']) : query.eq('status', status);
  }

  if (keyword) {
    const orConditions = [
      `order_id.ilike.%${keyword}%`,
      `recipient.ilike.%${keyword}%`,
      `phone.ilike.%${keyword}%`,
    ];
    if (userMatchedIds.length > 0) {
      orConditions.push(`user_id.in.(${userMatchedIds.join(',')})`);
    }
    query = query.or(orConditions.join(','));
  }

  if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

  const from = offset;
  const to = offset + limit - 1;

  const {
    data: orders,
    count,
    error: ordersError,
  } = await query.order('created_at', { ascending: false }).range(from, to);

  if (ordersError) throw ordersError;

  const pagedOrderIds = (orders ?? []).map((o) => o.order_id);

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('order_id, quantity, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (itemsError) throw itemsError;

  const result = (orders ?? []).map((o) => {
    const productSummary = (items ?? [])
      .filter((i) => i.order_id === o.order_id)
      .map((i) => {
        const product = i.products as unknown as { name: string } | null;
        return product ? `${product.name} ${i.quantity}개` : null;
      })
      .filter((s): s is string => Boolean(s))
      .join(', ');

    const user = o.users as unknown as { nickname: string } | null;

    return {
      id: o.order_id,
      orderDate: o.created_at,
      customer: user?.nickname ?? '알 수 없음',
      recipient: o.recipient ?? '',
      phone: o.phone ?? '',
      address: o.address ?? '',
      addressDetail: o.address_detail ?? '',
      productSummary,
      totalPrice: o.total_amount ?? 0,
      shippingFee: o.shipping_fee ?? 0,
      couponDiscount: o.coupon_discount ?? 0,
      pointAmount: o.used_point ?? 0,
      finalAmount: o.final_amount ?? 0,
      paymentMethod: o.payment_method,
      status: o.status,
    };
  });

  return { orders: result, total: count ?? 0 };
}

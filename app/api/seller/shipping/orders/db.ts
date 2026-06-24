import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SHIPPING_STATUS_TRANSITIONS: Record<string, string[]> = {
  결제완료: ['배송준비', '취소'],
  배송준비: ['배송중'],
  배송중: ['배송완료', '환불'],
  배송완료: ['환불'],
  취소: [],
  환불: [],
};

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
    .select(
      'order_id, created_at, status, recipient, phone, address, address_detail, shipping_request, final_amount, users(nickname)',
      { count: 'exact' }
    )
    .in('order_id', orderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료']);

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
    .select('order_id, quantity, unit_price, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (itemsError) throw itemsError;

  const { data: shippings, error: shippingsError } = await supabaseAdmin
    .from('shippings')
    .select('order_id, carrier, tracking_number, shipped_at, delivered_at')
    .eq('seller_id', sellerId)
    .in('order_id', pagedOrderIds);

  if (shippingsError) throw shippingsError;

  const result = (orders ?? []).map((o) => {
    const products = (items ?? [])
      .filter((i) => i.order_id === o.order_id)
      .map((i) => {
        const product = i.products as unknown as { name: string } | null;
        return product
          ? { name: product.name, quantity: i.quantity, unitPrice: i.unit_price }
          : null;
      })
      .filter((p): p is { name: string; quantity: number; unitPrice: number } => Boolean(p));

    const shipping = (shippings ?? []).find((s) => s.order_id === o.order_id);
    const user = o.users as unknown as { nickname: string } | null;

    return {
      id: o.order_id,
      customer: user?.nickname ?? '알 수 없음',
      recipient: o.recipient ?? '',
      phone: o.phone ?? '',
      address: o.address ?? '',
      addressDetail: o.address_detail ?? '',
      products,
      orderDate: o.created_at,
      status: o.status,
      courier: shipping?.carrier ?? '',
      trackingNumber: shipping?.tracking_number ?? '',
      shippingRequest: o.shipping_request ?? '',
      finalAmount: o.final_amount ?? 0,
      shippedAt: shipping?.shipped_at ?? null,
      deliveredAt: shipping?.delivered_at ?? null,
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
    return { 결제완료: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('status')
    .in('order_id', orderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료']);

  if (error) throw error;

  const counts = { 결제완료: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 };
  for (const row of data ?? []) {
    counts[row.status as keyof typeof counts] += 1;
  }

  return counts;
}

// 셀러 소유 주문인지 확인 + 현재 상태 조회 (공통 헬퍼)
async function getOwnedOrderStatus(sellerId: number, orderId: string) {
  const { data: orderItem, error: orderItemError } = await supabaseAdmin
    .from('order_items')
    .select('order_id')
    .eq('order_id', orderId)
    .eq('seller_id', sellerId)
    .limit(1)
    .maybeSingle();

  if (orderItemError) throw orderItemError;
  if (!orderItem) {
    throw new Error('주문을 찾을 수 없습니다.');
  }

  const { data: currentOrder, error: currentOrderError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('order_id', orderId)
    .single();

  if (currentOrderError) throw currentOrderError;

  return currentOrder.status as string;
}

export async function updateShippingStatus(sellerId: number, orderId: string, newStatus: string) {
  const currentStatus = await getOwnedOrderStatus(sellerId, orderId);

  const allowedNextStatuses = SHIPPING_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new Error(`'${currentStatus}' 상태에서는 '${newStatus}'로 변경할 수 없습니다.`);
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('order_id', orderId);

  if (updateError) throw updateError;

  if (newStatus === '배송완료') {
    const { error: deliveredAtError } = await supabaseAdmin
      .from('shippings')
      .update({ delivered_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('seller_id', sellerId);

    if (deliveredAtError) throw deliveredAtError;
  }

  return { status: newStatus };
}

export async function updateShippingTracking(
  sellerId: number,
  orderId: string,
  input: { courier: string; trackingNumber: string }
) {
  const { courier, trackingNumber } = input;

  const currentStatus = await getOwnedOrderStatus(sellerId, orderId);

  if (currentStatus !== '배송준비') {
    throw new Error(`'${currentStatus}' 상태에서는 운송장 정보를 입력할 수 없습니다.`);
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('shippings')
    .select('shipping_id')
    .eq('order_id', orderId)
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (existingError) throw existingError;

  const shippingPayload = {
    carrier: courier,
    tracking_number: trackingNumber,
    shipped_at: new Date().toISOString(),
  };

  if (existing) {
    const { error: updateError } = await supabaseAdmin
      .from('shippings')
      .update(shippingPayload)
      .eq('shipping_id', existing.shipping_id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabaseAdmin.from('shippings').insert({
      order_id: orderId,
      seller_id: sellerId,
      ...shippingPayload,
    });

    if (insertError) throw insertError;
  }

  const { error: statusUpdateError } = await supabaseAdmin
    .from('orders')
    .update({ status: '배송중' })
    .eq('order_id', orderId);

  if (statusUpdateError) throw statusUpdateError;

  return { newStatus: '배송중' };
}

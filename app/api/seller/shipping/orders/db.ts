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
  options: {
    page: number;
    limit: number;
    keyword?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const { page, limit, keyword, status, startDate, endDate } = options;

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerOrderIds = [...new Set((sellerItemRows ?? []).map((r) => r.order_id))];

  if (sellerOrderIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let orderQuery = supabaseAdmin
    .from('orders')
    .select(
      'order_id, created_at, status, recipient, phone, address, address_detail, shipping_request, final_amount, users(nickname)'
    )
    .in('order_id', sellerOrderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료']);

  if (status && status !== '전체') {
    orderQuery = orderQuery.eq('status', status);
  }

  if (keyword) {
    orderQuery = orderQuery.or(
      `order_id.ilike.%${keyword}%,recipient.ilike.%${keyword}%,phone.ilike.%${keyword}%`
    );
  }

  if (startDate) orderQuery = orderQuery.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) orderQuery = orderQuery.lte('created_at', `${endDate}T23:59:59`);

  const { data: matchedOrders, error: matchedOrdersError } = await orderQuery.order('created_at', {
    ascending: false,
  });

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

  const { data: shippings, error: shippingsError } = await supabaseAdmin
    .from('shippings')
    .select('order_id, carrier, tracking_number, shipped_at, delivered_at')
    .eq('seller_id', sellerId)
    .in('order_id', matchedOrderIds);

  if (shippingsError) throw shippingsError;

  let rows = (items ?? []).map((item) => {
    const order = (matchedOrders ?? []).find((o) => o.order_id === item.order_id);
    const shipping = (shippings ?? []).find((s) => s.order_id === item.order_id);
    const user = order?.users as unknown as { nickname: string } | null;
    const product = item.products as unknown as { name: string } | null;

    return {
      orderId: item.order_id,
      orderDate: order?.created_at ?? '',
      customer: user?.nickname ?? '알 수 없음',
      recipient: order?.recipient ?? '',
      phone: order?.phone ?? '',
      address: order?.address ?? '',
      addressDetail: order?.address_detail ?? '',
      shippingRequest: order?.shipping_request ?? '',
      itemId: item.item_id,
      productName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      finalAmount: order?.final_amount ?? 0,
      status: order?.status,
      courier: shipping?.carrier ?? '',
      trackingNumber: shipping?.tracking_number ?? '',
      shippedAt: shipping?.shipped_at ?? null,
      deliveredAt: shipping?.delivered_at ?? null,
    };
  });

  const total = rows.length;
  const from = (page - 1) * limit;
  const paged = rows.slice(from, from + limit);

  return { orders: paged, total };
}

export async function getSellerShippingOrderCounts(
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

  const emptyCounts = { 결제완료: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 };

  if (sellerOrderIds.length === 0) {
    return emptyCounts;
  }

  let orderQuery = supabaseAdmin
    .from('orders')
    .select('order_id, status')
    .in('order_id', sellerOrderIds)
    .in('status', ['결제완료', '배송준비', '배송중', '배송완료']);

  if (startDate) orderQuery = orderQuery.gte('created_at', `${startDate}T00:00:00`);
  if (endDate) orderQuery = orderQuery.lte('created_at', `${endDate}T23:59:59`);

  const { data: orders, error: ordersError } = await orderQuery;
  if (ordersError) throw ordersError;

  const orderStatusMap = new Map((orders ?? []).map((o) => [o.order_id, o.status]));

  const counts = { ...emptyCounts };
  for (const item of sellerItemRows ?? []) {
    const status = orderStatusMap.get(item.order_id) as keyof typeof counts | undefined;
    if (status && status in counts) {
      counts[status] += 1;
    }
  }

  return counts;
}

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

export async function bulkUpdateShippingStatus(
  sellerId: number,
  orderIds: string[],
  newStatus: string
) {
  const results: { orderId: string; success: boolean; error?: string }[] = [];

  for (const orderId of orderIds) {
    try {
      await updateShippingStatus(sellerId, orderId, newStatus);
      results.push({ orderId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
      results.push({ orderId, success: false, error: message });
    }
  }

  return results;
}

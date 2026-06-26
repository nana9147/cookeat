import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getOrdersWithRefundRequests(
  sellerId: number,
  options: { page: number; limit: number; status?: '환불요청' | '환불' }
) {
  const { page, limit, status } = options;

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerItemIds = (sellerItemRows ?? []).map((r) => r.item_id);
  if (sellerItemIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let refundQuery = supabaseAdmin
    .from('refund_requests')
    .select(
      'refund_id, item_id, status, request_reason, reject_reason, requested_at, processed_at, order_items(order_id, product_id, quantity, unit_price, products(name))'
    )
    .in('item_id', sellerItemIds);

  if (status) {
    refundQuery = refundQuery.eq('status', status);
  }

  const { data: refunds, error: refundsError } = await refundQuery.order('requested_at', {
    ascending: false,
  });

  if (refundsError) throw refundsError;

  if (!refunds || refunds.length === 0) {
    return { orders: [], total: 0 };
  }

  // 3. order_id 단위로 그룹핑
  const orderIds = [
    ...new Set(refunds.map((r) => (r.order_items as unknown as { order_id: string }).order_id)),
  ];

  const from = (page - 1) * limit;
  const to = from + limit;
  const pagedOrderIds = orderIds.slice(from, to);

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, created_at, status, recipient, phone, users(nickname)')
    .in('order_id', pagedOrderIds);

  if (ordersError) throw ordersError;

  const result = (orders ?? []).map((o) => {
    const orderRefunds = refunds.filter(
      (r) => (r.order_items as unknown as { order_id: string }).order_id === o.order_id
    );
    const user = o.users as unknown as { nickname: string } | null;

    return {
      id: o.order_id,
      orderDate: o.created_at,
      orderStatus: o.status,
      customer: user?.nickname ?? '알 수 없음',
      recipient: o.recipient ?? '',
      phone: o.phone ?? '',
      refundItems: orderRefunds.map((r) => {
        const orderItem = r.order_items as unknown as {
          product_id: number;
          quantity: number;
          unit_price: number;
          products: { name: string } | null;
        };
        return {
          itemId: r.item_id,
          refundId: r.refund_id,
          productName: orderItem.products?.name ?? '알 수 없음',
          quantity: orderItem.quantity,
          unitPrice: orderItem.unit_price,
          itemStatus: r.status,
          refundRequestReason: r.request_reason,
          refundRejectReason: r.reject_reason,
          requestedAt: r.requested_at,
          processedAt: r.processed_at,
        };
      }),
    };
  });

  return { orders: result, total: orderIds.length };
}

export async function approveRefund(sellerId: number, refundId: number) {
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refund_requests')
    .select('status, item_id, order_items(seller_id, order_id)')
    .eq('refund_id', refundId)
    .maybeSingle();

  if (refundError) throw refundError;
  if (!refund) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }

  const orderItem = refund.order_items as unknown as { seller_id: number; order_id: string };
  if (orderItem.seller_id !== sellerId) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }
  if (refund.status !== '환불요청') {
    throw new Error('환불요청 상태가 아닙니다.');
  }

  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({ status: '환불', processed_at: new Date().toISOString() })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  // 이 주문의 모든 상품(order_items)이 다 환불 완료됐는지 체크
  await syncOrderStatusIfFullyRefunded(orderItem.order_id);

  return { status: '환불' };
}

async function syncOrderStatusIfFullyRefunded(orderId: string) {
  const { data: allItems, error: allItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('order_id', orderId);

  if (allItemsError) throw allItemsError;

  const allItemIds = (allItems ?? []).map((i) => i.item_id);
  if (allItemIds.length === 0) return;

  const { data: refunds, error: refundsError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id, status, reject_reason')
    .in('item_id', allItemIds)
    .order('requested_at', { ascending: false });

  if (refundsError) throw refundsError;

  const latestStatusByItem = new Map<number, { status: string; rejectReason: string | null }>();
  for (const r of refunds ?? []) {
    if (!latestStatusByItem.has(r.item_id)) {
      latestStatusByItem.set(r.item_id, { status: r.status, rejectReason: r.reject_reason });
    }
  }

  const allRefunded = allItemIds.every((itemId) => {
    const entry = latestStatusByItem.get(itemId);
    return entry?.status === '환불' && !entry.rejectReason;
  });

  if (allRefunded) {
    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({ status: '환불' })
      .eq('order_id', orderId);

    if (orderUpdateError) throw orderUpdateError;
  }
}

export async function rejectRefund(sellerId: number, refundId: number, reason: string) {
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refund_requests')
    .select('status, order_items(seller_id)')
    .eq('refund_id', refundId)
    .maybeSingle();

  if (refundError) throw refundError;
  if (!refund) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }

  const orderItem = refund.order_items as unknown as { seller_id: number };
  if (orderItem.seller_id !== sellerId) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }
  if (refund.status !== '환불요청') {
    throw new Error('환불요청 상태가 아닙니다.');
  }

  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({ reject_reason: reason, processed_at: new Date().toISOString() })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  return { status: refund.status };
}

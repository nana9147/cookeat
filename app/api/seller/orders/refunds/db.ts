import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';
import { cancelPayment } from '@/lib/pgCancel';

export async function getOrdersWithRefundRequests(
  sellerId: number,
  options: {
    page: number;
    limit: number;
    tab?: '전체' | '취소요청' | '환불요청' | '환불진행중' | '처리완료';
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const { page, limit, tab, keyword, startDate, endDate } = options;

  let refundQuery = supabaseAdmin
    .from('refund_requests')
    .select(
      'refund_id, item_id, status, request_reason, reject_reason, requested_at, processed_at, return_courier, return_tracking_number, order_items!inner(order_id, product_id, quantity, unit_price, seller_id, products(name))'
    )
    .eq('order_items.seller_id', sellerId);

  if (startDate) refundQuery = refundQuery.gte('requested_at', `${startDate}T00:00:00`);
  if (endDate) refundQuery = refundQuery.lte('requested_at', `${endDate}T23:59:59`);

  const { data: refunds, error: refundsError } = await refundQuery.order('requested_at', {
    ascending: false,
  });

  if (refundsError) throw refundsError;

  if (!refunds || refunds.length === 0) {
    return { orders: [], total: 0 };
  }

  const latestByItem = new Map<number, (typeof refunds)[number]>();
  for (const r of refunds) {
    if (!latestByItem.has(r.item_id)) {
      latestByItem.set(r.item_id, r);
    }
  }
  let claims = [...latestByItem.values()];

  if (tab === '취소요청') {
    claims = claims.filter((r) => r.status === '취소요청' && !r.reject_reason);
  } else if (tab === '환불요청') {
    claims = claims.filter((r) => r.status === '환불요청' && !r.reject_reason);
  } else if (tab === '환불진행중') {
    claims = claims.filter((r) => r.status === '환불진행중');
  } else if (tab === '처리완료') {
    claims = claims.filter((r) => r.status === '취소' || r.status === '환불' || r.reject_reason);
  }

  if (keyword) {
    const allOrderIds = [
      ...new Set(claims.map((r) => (r.order_items as unknown as { order_id: string }).order_id)),
    ];

    const { data: orderMeta, error: orderMetaError } = await supabaseAdmin
      .from('orders')
      .select('order_id, user_id, users(nickname)')
      .in('order_id', allOrderIds);

    if (orderMetaError) throw orderMetaError;

    const customerByOrderId = new Map(
      (orderMeta ?? []).map((o) => [
        o.order_id,
        (o.users as unknown as { nickname: string } | null)?.nickname ?? '',
      ])
    );

    claims = claims.filter((r) => {
      const orderItem = r.order_items as unknown as {
        order_id: string;
        products: { name: string } | null;
      };
      const product = orderItem.products?.name ?? '';
      const customer = customerByOrderId.get(orderItem.order_id) ?? '';
      const lowerKeyword = keyword.toLowerCase();
      return (
        orderItem.order_id.toLowerCase().includes(lowerKeyword) ||
        product.toLowerCase().includes(lowerKeyword) ||
        customer.toLowerCase().includes(lowerKeyword)
      );
    });
  }

  const total = claims.length;
  const from = (page - 1) * limit;
  const pagedClaims = claims.slice(from, from + limit);

  if (pagedClaims.length === 0) {
    return { orders: [], total };
  }

  const pagedOrderIds = [
    ...new Set(pagedClaims.map((r) => (r.order_items as unknown as { order_id: string }).order_id)),
  ];

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, created_at, status, recipient, phone, users(nickname)')
    .in('order_id', pagedOrderIds);

  if (ordersError) throw ordersError;

  const result = (orders ?? []).map((o) => {
    const orderRefunds = pagedClaims.filter(
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
          returnCourier: r.return_courier,
          returnTrackingNumber: r.return_tracking_number,
        };
      }),
    };
  });

  return { orders: result, total };
}

export async function getRefundCounts(sellerId: number) {
  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerItemIds = (sellerItemRows ?? []).map((r) => r.item_id);

  const emptyCounts = { 전체: 0, 취소요청: 0, 환불요청: 0, 환불진행중: 0, 처리완료: 0 };

  if (sellerItemIds.length === 0) {
    return emptyCounts;
  }

  const { data: refunds, error: refundsError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id, status, reject_reason')
    .in('item_id', sellerItemIds)
    .order('requested_at', { ascending: false });

  if (refundsError) throw refundsError;

  const latestByItem = new Map<number, { status: string; rejectReason: string | null }>();
  for (const r of refunds ?? []) {
    if (!latestByItem.has(r.item_id)) {
      latestByItem.set(r.item_id, { status: r.status, rejectReason: r.reject_reason });
    }
  }

  const counts = { ...emptyCounts };
  for (const { status, rejectReason } of latestByItem.values()) {
    counts.전체 += 1;
    if (rejectReason || status === '취소' || status === '환불') {
      counts.처리완료 += 1;
    } else if (status === '취소요청') {
      counts.취소요청 += 1;
    } else if (status === '환불요청') {
      counts.환불요청 += 1;
    } else if (status === '환불진행중') {
      counts.환불진행중 += 1;
    }
  }

  return counts;
}

export async function approveRefund(sellerId: number, refundId: number) {
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refund_requests')
    .select(
      'status, item_id, order_items!inner(seller_id, order_id, unit_price, quantity, orders!inner(payment_method, payment_key))'
    )
    .eq('refund_id', refundId)
    .maybeSingle();

  if (refundError) throw refundError;
  if (!refund) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }

  const orderItem = refund.order_items as unknown as {
    seller_id: number;
    order_id: string;
    unit_price: number;
    quantity: number;
    orders: { payment_method: string; payment_key: string | null };
  };
  if (orderItem.seller_id !== sellerId) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }
  if (refund.status !== '환불요청' && refund.status !== '취소요청') {
    throw new Error('처리 대기 중인 요청이 아닙니다.');
  }

  const { data: confirmed, error: confirmedError } = await supabaseAdmin
    .from('order_item_status_history')
    .select('order_item_id')
    .eq('order_item_id', refund.item_id)
    .eq('status', '구매확정')
    .limit(1);

  if (confirmedError) throw confirmedError;
  if (confirmed && confirmed.length > 0) {
    throw new Error('구매확정된 항목은 환불 처리할 수 없습니다.');
  }

  const { data: currentItem, error: currentItemError } = await supabaseAdmin
    .from('order_items')
    .select('shipping_status')
    .eq('item_id', refund.item_id)
    .single();

  if (currentItemError) throw currentItemError;
  const originalShippingStatus = currentItem.shipping_status;

  const isCancel = refund.status === '취소요청';
  const approvedStatus = isCancel ? '취소' : '환불진행중';
  const originalStatus = refund.status;
  const processedAt = new Date().toISOString();

  if (isCancel) {
    const { payment_method, payment_key } = orderItem.orders;
    if (payment_key) {
      const cancelAmount = orderItem.unit_price * orderItem.quantity;
      await cancelPayment(payment_method, payment_key, cancelAmount);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({ status: approvedStatus, processed_at: isCancel ? processedAt : null })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  try {
    const { error: shippingStatusError } = await supabaseAdmin
      .from('order_items')
      .update({ shipping_status: approvedStatus })
      .eq('item_id', refund.item_id);

    if (shippingStatusError) throw shippingStatusError;

    await logOrderItemStatusHistory(refund.item_id, approvedStatus);
    if (isCancel) {
      await restoreOrderBenefitsForItem(orderItem.order_id, refund.item_id);
    }
  } catch (err) {
    await supabaseAdmin
      .from('refund_requests')
      .update({ status: originalStatus, processed_at: null })
      .eq('refund_id', refundId);

    await supabaseAdmin
      .from('order_items')
      .update({ shipping_status: originalShippingStatus })
      .eq('item_id', refund.item_id);

    throw err;
  }

  return { status: approvedStatus };
}

export async function updateReturnTracking(
  sellerId: number,
  refundId: number,
  input: { courier: string; trackingNumber: string }
) {
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
  if (refund.status !== '환불진행중') {
    throw new Error('환불진행중 상태에서만 반송 운송장을 입력할 수 있습니다.');
  }

  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({
      return_courier: input.courier,
      return_tracking_number: input.trackingNumber,
    })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  return { returnCourier: input.courier, returnTrackingNumber: input.trackingNumber };
}

async function syncOrderStatusIfFullyClosed(orderId: string): Promise<boolean> {
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('shipping_status')
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return false;

  const allCancelled = items.every((i) => i.shipping_status === '취소');
  const allClosed = items.every(
    (i) => i.shipping_status === '취소' || i.shipping_status === '환불'
  );

  if (allCancelled) {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: '취소' })
      .eq('order_id', orderId);
    if (error) throw error;
  } else if (allClosed) {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: '환불' })
      .eq('order_id', orderId);
    if (error) throw error;
  }

  return allClosed;
}

async function restoreOrderBenefitsForItem(orderId: string, itemId: number) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('used_point, refunded_point, user_coupon_id, user_id')
    .eq('order_id', orderId)
    .single();

  if (orderError) throw orderError;

  const CLOSED_STATUSES = ['취소', '환불'];

  // 주문 전체(멀티셀러 포함)에서, 아직 살아있는(취소/환불 안 된) 상품들의 "쿠폰 반영 후" 금액 합
  const { data: allItems, error: allItemsError } = await supabaseAdmin
    .from('order_items')
    .select('quantity, unit_price, shipping_status, allocated_coupon_discount')
    .eq('order_id', orderId);

  if (allItemsError) throw allItemsError;

  const remainingBase = (allItems ?? [])
    .filter((i) => !CLOSED_STATUSES.includes(i.shipping_status ?? ''))
    .reduce((sum, i) => sum + i.quantity * i.unit_price - (i.allocated_coupon_discount ?? 0), 0);

  const usedPoint = order.used_point ?? 0;
  const effectivePoints = Math.min(usedPoint, Math.max(0, remainingBase));
  const targetTotalRefund = usedPoint - effectivePoints;
  const incrementalRefund = targetTotalRefund - (order.refunded_point ?? 0);

  if (incrementalRefund > 0) {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('point')
      .eq('user_id', order.user_id)
      .single();
    if (userError) throw userError;

    const { error: pointUpdateError } = await supabaseAdmin
      .from('users')
      .update({ point: (user.point ?? 0) + incrementalRefund })
      .eq('user_id', order.user_id);
    if (pointUpdateError) throw pointUpdateError;

    const { error: historyError } = await supabaseAdmin.from('point_history').insert({
      user_id: order.user_id,
      type: '적립',
      amount: incrementalRefund,
      description: `주문 ${orderId} 취소/환불에 따른 포인트 환급`,
    });
    if (historyError) throw historyError;

    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({ refunded_point: targetTotalRefund })
      .eq('order_id', orderId);
    if (orderUpdateError) throw orderUpdateError;
  }

  const allClosed = await syncOrderStatusIfFullyClosed(orderId);

  if (allClosed && order.user_coupon_id) {
    const { error: couponRestoreError } = await supabaseAdmin
      .from('user_coupons')
      .update({ used_at: null })
      .eq('id', order.user_coupon_id);
    if (couponRestoreError) throw couponRestoreError;
  }
}

export async function rejectRefund(sellerId: number, refundId: number, reason: string) {
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refund_requests')
    .select('status, item_id, order_items(seller_id)')
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
  if (refund.status !== '환불요청' && refund.status !== '취소요청') {
    throw new Error('처리 대기 중인 요청이 아닙니다.');
  }

  const rejectedStatus = refund.status === '취소요청' ? '취소거부' : '환불거부';
  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({
      status: rejectedStatus,
      reject_reason: reason,
      processed_at: new Date().toISOString(),
    })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  await logOrderItemStatusHistory(refund.item_id, rejectedStatus, reason);

  return { status: rejectedStatus };
}

export async function processRefund(sellerId: number, refundId: number) {
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refund_requests')
    .select(
      'status, item_id, order_items!inner(seller_id, order_id, unit_price, quantity, orders!inner(payment_method, payment_key))'
    )
    .eq('refund_id', refundId)
    .maybeSingle();

  if (refundError) throw refundError;
  if (!refund) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }

  const orderItem = refund.order_items as unknown as {
    seller_id: number;
    order_id: string;
    unit_price: number;
    quantity: number;
    orders: { payment_method: string; payment_key: string | null };
  };
  if (orderItem.seller_id !== sellerId) {
    throw new Error('환불 요청을 찾을 수 없습니다.');
  }
  if (refund.status !== '환불진행중') {
    throw new Error('환불 처리 대상이 아닙니다.');
  }

  const { data: currentItem, error: currentItemError } = await supabaseAdmin
    .from('order_items')
    .select('shipping_status')
    .eq('item_id', refund.item_id)
    .single();

  if (currentItemError) throw currentItemError;
  const originalShippingStatus = currentItem.shipping_status;

  const processedAt = new Date().toISOString();

  const { payment_method, payment_key } = orderItem.orders;
  if (payment_key) {
    const cancelAmount = orderItem.unit_price * orderItem.quantity;
    await cancelPayment(payment_method, payment_key, cancelAmount);
  }

  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({ status: '환불', processed_at: processedAt })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  try {
    const { error: shippingStatusError } = await supabaseAdmin
      .from('order_items')
      .update({ shipping_status: '환불' })
      .eq('item_id', refund.item_id);

    if (shippingStatusError) throw shippingStatusError;

    await logOrderItemStatusHistory(refund.item_id, '환불');
    await restoreOrderBenefitsForItem(orderItem.order_id, refund.item_id);
  } catch (err) {
    await supabaseAdmin
      .from('refund_requests')
      .update({ status: '환불진행중', processed_at: null })
      .eq('refund_id', refundId);

    await supabaseAdmin
      .from('order_items')
      .update({ shipping_status: originalShippingStatus })
      .eq('item_id', refund.item_id);

    throw err;
  }

  return { status: '환불' };
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';

export async function getOrdersWithRefundRequests(
  sellerId: number,
  options: {
    page: number;
    limit: number;
    tab?: '전체' | '취소요청' | '환불요청' | '처리완료';
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const { page, limit, tab, keyword, startDate, endDate } = options;

  let refundQuery = supabaseAdmin
    .from('refund_requests')
    .select(
      'refund_id, item_id, status, request_reason, reject_reason, requested_at, processed_at, order_items!inner(order_id, product_id, quantity, unit_price, seller_id, products(name))'
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

  const emptyCounts = { 전체: 0, 취소요청: 0, 환불요청: 0, 처리완료: 0 };

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
    }
  }

  return counts;
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

  const approvedStatus = refund.status === '취소요청' ? '취소' : '환불';
  const originalStatus = refund.status;
  const processedAt = new Date().toISOString();

  // Step 1: refund_requests 상태 업데이트
  const { error: updateError } = await supabaseAdmin
    .from('refund_requests')
    .update({ status: approvedStatus, processed_at: processedAt })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  // Step 2~3: 이력 기록 + 주문 상태 동기화 — 실패 시 Step 1 롤백
  try {
    await logOrderItemStatusHistory(refund.item_id, approvedStatus);
    await syncOrderStatusIfFullyRefunded(orderItem.order_id);
  } catch (err) {
    await supabaseAdmin
      .from('refund_requests')
      .update({ status: originalStatus, processed_at: null })
      .eq('refund_id', refundId);
    throw err;
  }

  return { status: approvedStatus };
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
    .update({ status: rejectedStatus, reject_reason: reason, processed_at: new Date().toISOString() })
    .eq('refund_id', refundId);

  if (updateError) throw updateError;

  await logOrderItemStatusHistory(refund.item_id, rejectedStatus, reason);

  return { status: rejectedStatus };
}

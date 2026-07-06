import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';

type ClaimType = '취소' | '환불';

type ClaimConfig = {
  allowedShippingStatuses: string[];
  requestStatus: string;
  defaultReason: string;
  noCandidateError: string;
  alreadyPendingError: string;
};

// order_items.shipping_status 기준으로 신청 가능 여부를 판단한다 — orders.status는
// 멀티셀러 주문에서 "가장 덜 진행된 아이템" 기준으로 집계되어 부정확할 수 있다.
const CLAIM_CONFIG: Record<ClaimType, ClaimConfig> = {
  취소: {
    allowedShippingStatuses: ['결제완료'],
    requestStatus: '취소요청',
    defaultReason: '구매자 취소 신청',
    noCandidateError: '취소 신청이 가능한 상품이 없습니다. 이미 배송이 시작되었거나 처리된 주문입니다.',
    alreadyPendingError: '이미 취소 신청이 접수된 주문입니다.',
  },
  환불: {
    allowedShippingStatuses: ['배송완료'],
    requestStatus: '환불요청',
    defaultReason: '구매자 환불 신청',
    noCandidateError: '환불 신청이 가능한 상품이 없습니다. 배송완료된 주문만 신청할 수 있습니다.',
    alreadyPendingError: '이미 환불 신청이 접수되었거나 구매확정된 주문입니다.',
  },
};

const ACTIVE_CLAIM_STATUSES = ['취소요청', '환불요청', '환불진행중'];

// 취소(app/api/orders/[orderId]/cancel)와 환불(app/api/orders/[orderId]/refund) 신청은
// 인증/조회/중복확인/기록 로직이 동일해 하나의 헬퍼로 공유한다.
export async function createOrderClaim(
  claimType: ClaimType,
  orderId: string,
  userId: number,
  reason: string | undefined
): Promise<NextResponse> {
  const config = CLAIM_CONFIG[claimType];

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('order_id, status, order_items(item_id, shipping_status)')
    .eq('order_id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });

  const items = (order.order_items ?? []) as { item_id: number; shipping_status: string }[];
  const candidateItems = items.filter((i) => config.allowedShippingStatuses.includes(i.shipping_status));
  if (candidateItems.length === 0) {
    return NextResponse.json({ error: config.noCandidateError }, { status: 400 });
  }
  const candidateItemIds = candidateItems.map((i) => i.item_id);

  // 구매확정된 상품은 판매자 승인 단계에서도 처리가 막히므로(app/api/seller/orders/refunds/db.ts
  // approveRefund) 신청 시점에 먼저 걸러 승인 불가능한 요청이 쌓이는 것을 막는다.
  // 두 조회는 candidateItemIds에만 의존하고 서로 독립적이므로 병렬로 실행한다.
  const [confirmedResult, existingResult] = await Promise.all([
    supabaseAdmin
      .from('order_item_status_history')
      .select('order_item_id')
      .in('order_item_id', candidateItemIds)
      .eq('status', '구매확정'),
    supabaseAdmin
      .from('refund_requests')
      .select('item_id')
      .in('item_id', candidateItemIds)
      .in('status', ACTIVE_CLAIM_STATUSES)
      .is('reject_reason', null),
  ]);

  if (confirmedResult.error) {
    return NextResponse.json({ error: confirmedResult.error.message }, { status: 500 });
  }
  if (existingResult.error) {
    return NextResponse.json({ error: existingResult.error.message }, { status: 500 });
  }

  const confirmedItemIds = new Set((confirmedResult.data ?? []).map((r) => r.order_item_id));
  const pendingItemIds = new Set((existingResult.data ?? []).map((r) => r.item_id));

  const itemIds = candidateItemIds.filter(
    (id) => !confirmedItemIds.has(id) && !pendingItemIds.has(id)
  );

  if (itemIds.length === 0) {
    return NextResponse.json({ error: config.alreadyPendingError }, { status: 409 });
  }

  const requestedAt = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from('refund_requests').insert(
    itemIds.map((itemId) => ({
      item_id: itemId,
      status: config.requestStatus,
      request_reason: reason ?? config.defaultReason,
      requested_at: requestedAt,
    }))
  );

  if (insertError) {
    // refund_requests_pending_item_unique — 동시 요청(더블클릭/다중 탭)으로 인한 중복 신청
    if (insertError.code === '23505') {
      return NextResponse.json({ error: config.alreadyPendingError }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await Promise.all(itemIds.map((itemId) => logOrderItemStatusHistory(itemId, config.requestStatus)));

  return NextResponse.json({ success: true });
}

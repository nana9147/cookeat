import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';

// order_items.shipping_status 기준 — 배송완료 후 구매확정 전까지만 환불 신청 가능
const REFUNDABLE_ITEM_STATUSES = ['배송완료'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { orderId } = await params;

  let reason: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.reason === 'string') reason = body.reason.slice(0, 200);
  } catch {
    // 본문 없이 호출된 경우 사유 없이 진행
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('order_id, status, order_items(item_id, shipping_status)')
    .eq('order_id', orderId)
    .eq('user_id', authed.userId)
    .maybeSingle();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });

  const items = (order.order_items ?? []) as { item_id: number; shipping_status: string }[];
  const candidateItems = items.filter((i) => REFUNDABLE_ITEM_STATUSES.includes(i.shipping_status));
  if (candidateItems.length === 0) {
    return NextResponse.json(
      { error: '환불 신청이 가능한 상품이 없습니다. 배송완료된 주문만 신청할 수 있습니다.' },
      { status: 400 }
    );
  }
  const candidateItemIds = candidateItems.map((i) => i.item_id);

  // 구매확정된 상품은 판매자 승인 단계에서도 환불이 막히므로(app/api/seller/orders/refunds/db.ts
  // approveRefund) 신청 시점에 먼저 걸러 승인 불가능한 요청이 쌓이는 것을 막는다.
  const { data: confirmedRows, error: confirmedError } = await supabaseAdmin
    .from('order_item_status_history')
    .select('order_item_id')
    .in('order_item_id', candidateItemIds)
    .eq('status', '구매확정');

  if (confirmedError) return NextResponse.json({ error: confirmedError.message }, { status: 500 });
  const confirmedItemIds = new Set((confirmedRows ?? []).map((r) => r.order_item_id));

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id')
    .in('item_id', candidateItemIds)
    .eq('status', '환불요청')
    .is('reject_reason', null);

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  const pendingItemIds = new Set((existing ?? []).map((r) => r.item_id));

  const itemIds = candidateItemIds.filter(
    (id) => !confirmedItemIds.has(id) && !pendingItemIds.has(id)
  );

  if (itemIds.length === 0) {
    return NextResponse.json(
      { error: '이미 환불 신청이 접수되었거나 구매확정된 주문입니다.' },
      { status: 409 }
    );
  }

  const requestedAt = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from('refund_requests').insert(
    itemIds.map((itemId) => ({
      item_id: itemId,
      status: '환불요청',
      request_reason: reason ?? '구매자 환불 신청',
      requested_at: requestedAt,
    }))
  );

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await Promise.all(itemIds.map((itemId) => logOrderItemStatusHistory(itemId, '환불요청')));

  return NextResponse.json({ success: true });
}

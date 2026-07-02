import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logOrderItemStatusHistory } from '@/lib/orderItemStatusHistory';

const CANCELLABLE_STATUSES = ['결제완료', '주문확인'];

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
    .select('order_id, status, order_items(item_id)')
    .eq('order_id', orderId)
    .eq('user_id', authed.userId)
    .maybeSingle();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json({ error: '취소 신청이 불가능한 주문 상태입니다.' }, { status: 400 });
  }

  const items = (order.order_items ?? []) as { item_id: number }[];
  if (items.length === 0) {
    return NextResponse.json({ error: '취소할 상품이 없습니다.' }, { status: 400 });
  }
  const itemIds = items.map((i) => i.item_id);

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id')
    .in('item_id', itemIds)
    .eq('status', '취소요청')
    .is('reject_reason', null);

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: '이미 취소 신청이 접수된 주문입니다.' }, { status: 409 });
  }

  const requestedAt = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from('refund_requests').insert(
    itemIds.map((itemId) => ({
      item_id: itemId,
      status: '취소요청',
      request_reason: reason ?? '구매자 취소 신청',
      requested_at: requestedAt,
    }))
  );

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await Promise.all(itemIds.map((itemId) => logOrderItemStatusHistory(itemId, '취소요청')));

  return NextResponse.json({ success: true });
}

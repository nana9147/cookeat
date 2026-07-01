import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  let body: { paymentKey: string; orderId: string; amount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const { paymentKey, orderId, amount } = body;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('final_amount, user_id, status')
    .eq('order_id', orderId)
    .single();

  if (error || !order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  if (order.user_id !== authed.userId) return new NextResponse('Forbidden', { status: 403 });
  if (order.status === '결제완료') return NextResponse.json({ status: 'DONE' });
  if (order.final_amount !== amount) return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount: order.final_amount }),
  });

  if (!res.ok) {
    const tossError = await res.json();
    return NextResponse.json({ error: tossError }, { status: res.status });
  }

  const tossData = await res.json();

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: '결제완료', payment_method: '카드', payment_key: paymentKey, updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  if (updateError) {
    console.error('[toss/confirm] 주문 상태 업데이트 실패:', updateError.message);
    return NextResponse.json({ error: '주문 상태 업데이트 실패' }, { status: 500 });
  }

  return NextResponse.json(tossData);
}

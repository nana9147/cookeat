import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { paymentKey, orderId, amount } = await req.json();

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

  await supabaseAdmin
    .from('orders')
    .update({ status: '결제완료', payment_method: '카드', updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  const data = await res.json();
  return NextResponse.json(data);
}

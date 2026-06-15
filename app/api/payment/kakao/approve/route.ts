import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CID = process.env.KAKAO_CID ?? 'TC0ONETIME';
const SECRET_KEY = process.env.KAKAO_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { tid, pgToken, orderId } = await req.json();

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('user_id, status')
    .eq('order_id', orderId)
    .single();

  if (error || !order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  if (order.user_id !== authed.userId) return new NextResponse('Forbidden', { status: 403 });
  if (order.status === '결제완료') return NextResponse.json({ tid });

  const res = await fetch('https://open-api.kakaopay.com/online/v1/payment/approve', {
    method: 'POST',
    headers: {
      Authorization: `SECRET_KEY ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cid: CID,
      tid,
      partner_order_id: orderId,
      partner_user_id: String(authed.userId),
      pg_token: pgToken,
    }),
  });

  if (!res.ok) {
    const kakaoError = await res.json();
    return NextResponse.json({ error: kakaoError }, { status: res.status });
  }

  await supabaseAdmin
    .from('orders')
    .update({ status: '결제완료', payment_method: '카카오페이', updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  const data = await res.json();
  return NextResponse.json(data);
}

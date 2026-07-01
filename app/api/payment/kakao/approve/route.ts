import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CID = process.env.KAKAO_CID ?? 'TC0ONETIME';
const SECRET_KEY = process.env.KAKAO_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  let body: { tid: string; pgToken: string; orderId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const { tid, pgToken, orderId } = body;

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

  const kakaoData = await res.json();

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: '결제완료', payment_method: '카카오페이', payment_key: tid, updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  if (updateError) {
    console.error('[kakao/approve] 주문 상태 업데이트 실패:', updateError.message);
    return NextResponse.json({ error: '주문 상태 업데이트 실패' }, { status: 500 });
  }

  return NextResponse.json(kakaoData);
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CID = process.env.KAKAO_CID ?? 'TC0ONETIME';
const SECRET_KEY = process.env.KAKAO_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  let body: { orderId: string; itemName: string; quantity: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  const { orderId, itemName, quantity } = body;

  // 클라가 보낸 금액은 신뢰하지 않고, 서버가 주문을 다시 읽어 실제 결제 금액을 구한다
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('final_amount, status, user_id')
    .eq('order_id', orderId)
    .single();

  if (error || !order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  if (order.user_id !== authed.userId) return new NextResponse('Forbidden', { status: 403 });
  if (order.status !== '결제전') {
    return NextResponse.json({ error: '이미 처리된 주문입니다.' }, { status: 400 });
  }

  const totalAmount = order.final_amount;

  const res = await fetch('https://open-api.kakaopay.com/online/v1/payment/ready', {
    method: 'POST',
    headers: {
      Authorization: `SECRET_KEY ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cid: CID,
      partner_order_id: orderId,
      partner_user_id: String(authed.userId),
      item_name: itemName,
      quantity,
      total_amount: totalAmount,
      vat_amount: Math.floor(totalAmount / 11),
      tax_free_amount: 0,
      approval_url: `${BASE_URL}/cart/complete`,
      cancel_url: `${BASE_URL}/cart/checkout`,
      fail_url: `${BASE_URL}/cart/checkout`,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ tid: data.tid, redirectUrl: data.next_redirect_pc_url, mobileUrl: data.next_redirect_mobile_url });
}

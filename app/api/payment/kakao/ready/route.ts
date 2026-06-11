import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';

const CID = process.env.KAKAO_CID ?? 'TC0ONETIME';
const SECRET_KEY = process.env.KAKAO_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { orderId, itemName, quantity, totalAmount } = await req.json();

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

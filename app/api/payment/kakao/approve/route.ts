import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';

const CID = process.env.KAKAO_CID ?? 'TC0ONETIME';
const SECRET_KEY = process.env.KAKAO_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { tid, pgToken, orderId } = await req.json();

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
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

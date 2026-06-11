import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';

const SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { paymentKey, orderId, amount } = await req.json();

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

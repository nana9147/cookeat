import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { createOrderClaim } from '@/lib/orderClaims';

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

  return createOrderClaim('환불', orderId, authed.userId, reason);
}

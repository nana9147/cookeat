import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateShippingTracking } from '../db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { itemId } = await params;
  const body = await req.json();
  const { courier, trackingNumber } = body;

  try {
    const result = await updateShippingTracking(sellerCtx.sellerId, Number(itemId), {
      courier,
      trackingNumber,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '운송장 등록에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 409 });
  }
}

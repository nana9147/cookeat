import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateShippingStatus } from '../../db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { itemId } = await params;
  const body = await req.json();
  const { status } = body;

  try {
    const result = await updateShippingStatus(sellerCtx.sellerId, Number(itemId), status);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 409 });
  }
}

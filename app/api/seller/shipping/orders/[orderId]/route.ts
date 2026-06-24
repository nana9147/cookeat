import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateShippingTracking } from '../db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { orderId } = await params;
  const body = await req.json();
  const { courier, trackingNumber } = body;

  if (!courier || !trackingNumber) {
    return NextResponse.json(
      { success: false, error: '택배사와 운송장번호를 모두 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    const { newStatus } = await updateShippingTracking(sellerCtx.sellerId, orderId, {
      courier,
      trackingNumber,
    });

    return NextResponse.json({ success: true, data: { newStatus } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '운송장 등록에 실패했습니다.';
    const status =
      message === '주문을 찾을 수 없습니다.' ? 404 : message.includes('상태에서는') ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

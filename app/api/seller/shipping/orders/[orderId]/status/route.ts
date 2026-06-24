import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateShippingStatus } from '../../db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { orderId } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { success: false, error: '변경할 상태를 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    await updateShippingStatus(sellerCtx.sellerId, orderId, status);
    return NextResponse.json({ success: true, data: { status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
    const status_code = message === '주문을 찾을 수 없습니다.' ? 404 : 409;
    return NextResponse.json({ success: false, error: message }, { status: status_code });
  }
}

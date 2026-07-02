import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { approveRefund, rejectRefund, processRefund, updateReturnTracking } from '../db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { refundId } = await params;
  const body = await req.json();
  const { action, reason, courier, trackingNumber } = body;

  if (!action || !['approve', 'reject', 'process', 'saveTracking'].includes(action)) {
    return NextResponse.json(
      {
        success: false,
        error: 'action은 approve, reject, process, saveTracking 중 하나여야 합니다.',
      },
      { status: 400 }
    );
  }

  if (action === 'reject' && !reason) {
    return NextResponse.json(
      { success: false, error: '거부 사유를 입력해주세요.' },
      { status: 400 }
    );
  }

  if (action === 'saveTracking' && (!courier || !trackingNumber)) {
    return NextResponse.json(
      { success: false, error: '택배사와 운송장번호를 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    const result =
      action === 'approve'
        ? await approveRefund(sellerCtx.sellerId, Number(refundId))
        : action === 'process'
          ? await processRefund(sellerCtx.sellerId, Number(refundId))
          : action === 'saveTracking'
            ? await updateReturnTracking(sellerCtx.sellerId, Number(refundId), {
                courier,
                trackingNumber,
              })
            : await rejectRefund(sellerCtx.sellerId, Number(refundId), reason);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '처리에 실패했습니다.';
    const status = message === '환불 요청을 찾을 수 없습니다.' ? 404 : 409;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

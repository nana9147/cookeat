import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { createReviewReport } from './db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const context = await requireSellerContext(req);
  if (context instanceof NextResponse) return context;
  const { sellerId, userId } = context;

  const { reviewId: reviewIdParam } = await params;
  const reviewId = Number(reviewIdParam);
  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 리뷰 ID입니다.' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const reason = body?.reason?.trim();

  if (!reason || reason.length > 500) {
    return NextResponse.json(
      { success: false, error: '신고 사유는 500자 이내로 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    await createReviewReport({ reviewId, sellerId, reporterId: userId, reason });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: '본인 상품의 리뷰만 신고할 수 있습니다.' },
        { status: 403 }
      );
    }
    if (err instanceof Error && err.message === 'ALREADY_REPORTED') {
      return NextResponse.json(
        { success: false, error: '이미 신고한 리뷰입니다.' },
        { status: 409 }
      );
    }
    console.error('[POST /seller/reviews/:reviewId/report] error:', err);
    return NextResponse.json(
      { success: false, error: '신고 접수에 실패했습니다.' },
      { status: 500 }
    );
  }
}

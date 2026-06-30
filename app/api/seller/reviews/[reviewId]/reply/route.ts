import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { upsertReviewReply } from './db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const context = await requireSellerContext(req);
  if (context instanceof NextResponse) return context;
  const { sellerId } = context;

  const { reviewId: reviewIdParam } = await params;
  const reviewId = Number(reviewIdParam);
  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 리뷰 ID입니다.' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const content = body?.content?.trim();

  if (!content || content.length > 2000) {
    return NextResponse.json(
      { success: false, error: '답글은 2000자 이내로 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    const reply = await upsertReviewReply({ reviewId, sellerId, content });
    return NextResponse.json({ success: true, data: reply });
  } catch (err) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json(
        { success: false, error: '본인 상품의 리뷰에만 답글을 작성할 수 있습니다.' },
        { status: 403 }
      );
    }
    console.error('[POST /seller/reviews/:reviewId/reply] error:', err);
    return NextResponse.json(
      { success: false, error: '답글 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

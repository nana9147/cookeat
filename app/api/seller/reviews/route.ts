import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerReviews, getSellerReviewSummary } from './db';
import type { ReviewTabFilter } from '@/types/seller/review';

const VALID_FILTERS: ReviewTabFilter[] = ['전체', '답변 대기', '별점 높은 순', '사진 리뷰'];

export async function GET(req: NextRequest) {
  const context = await requireSellerContext(req);
  if (context instanceof NextResponse) return context;
  const { sellerId } = context;

  const { searchParams } = req.nextUrl;
  const filterParam = searchParams.get('filter') ?? '전체';
  const filter: ReviewTabFilter = VALID_FILTERS.includes(filterParam as ReviewTabFilter)
    ? (filterParam as ReviewTabFilter)
    : '전체';
  const ratingParam = searchParams.get('rating');
  const ratingFilter = ratingParam ? Number(ratingParam) : undefined;
  const keyword = searchParams.get('keyword') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(Math.max(1, Number(searchParams.get('limit') ?? '10')), 50);

  const sortParam = searchParams.get('sort');
  const sortOrder: 'rating_desc' | 'rating_asc' | undefined =
    sortParam === 'rating_desc' || sortParam === 'rating_asc' ? sortParam : undefined;

  try {
    const [{ reviews, total }, summary] = await Promise.all([
      getSellerReviews({ sellerId, filter, ratingFilter, sortOrder, keyword, page, limit }),
      getSellerReviewSummary(sellerId),
    ]);

    return NextResponse.json({
      success: true,
      data: { reviews, summary, pagination: { page, limit, total, hasNext: page * limit < total } },
    });
  } catch (err) {
    console.error('[GET /seller/reviews] error:', err);
    return NextResponse.json(
      { success: false, error: '리뷰 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

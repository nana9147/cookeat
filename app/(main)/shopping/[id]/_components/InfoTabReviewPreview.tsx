import { ReviewCard, RatingSummary, type ApiReview } from '@/components/common/ReviewSection';

interface Props {
  reviews: ApiReview[];
  reviewCount: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  onViewAll: () => void;
}

export function InfoTabReviewPreview({
  reviews,
  reviewCount,
  averageRating,
  ratingBreakdown,
  onViewAll,
}: Props) {
  if (reviews.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-dark-text">
          리뷰{' '}
          <span className="text-gray-text font-normal text-sm">{reviewCount.toLocaleString()}</span>
        </h3>
        <button onClick={onViewAll} className="text-xs text-primary hover:underline">
          리뷰 전체보기
        </button>
      </div>
      <div className="mb-4">
        <RatingSummary
          averageRating={averageRating}
          totalCount={reviewCount}
          ratingBreakdown={ratingBreakdown}
        />
      </div>
      <ul className="flex flex-col gap-3">
        {reviews.slice(0, 2).map((review) => (
          <li key={review.reviewId}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
      <button
        onClick={onViewAll}
        className="w-full mt-3 h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
      >
        리뷰 더보기
      </button>
    </div>
  );
}

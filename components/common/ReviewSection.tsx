import { Review, ReviewCard } from './ReviewCard';
import { RatingSummary } from './RatingSummary';

export type { Review };
export { ReviewCard, RatingSummary };

interface ReviewSectionProps {
  averageRating: number;
  totalCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Review[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ReviewSection({
  averageRating,
  totalCount,
  ratingBreakdown,
  reviews,
  onLoadMore,
  hasMore,
}: ReviewSectionProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-dark-text mb-4">
        리뷰{' '}
        <span className="text-gray-text font-normal text-sm">{totalCount.toLocaleString()}</span>
      </h2>
      <div className="mb-6">
        <RatingSummary
          averageRating={averageRating}
          totalCount={totalCount}
          ratingBreakdown={ratingBreakdown}
        />
      </div>
      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full mt-4 h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
        >
          리뷰 더 보기
        </button>
      )}
      {reviews.length === 0 && (
        <p className="py-10 text-center text-sm text-light-gray">아직 리뷰가 없어요.</p>
      )}
    </section>
  );
}

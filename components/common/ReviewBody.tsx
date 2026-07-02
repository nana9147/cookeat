'use client';

import { ReviewCard, type ApiReview } from './ReviewCard';

interface ReviewBodyProps {
  reviews: ApiReview[];
  compact: boolean;
  hasMore: boolean;
  currentAuthId?: string;
  onViewAll?: () => void;
  onLoadMore: () => void;
  onEdit: (review: ApiReview) => void;
  onDelete: (reviewId: number) => void;
}

export function ReviewBody({ reviews, compact, hasMore, currentAuthId, onViewAll, onLoadMore, onEdit, onDelete }: ReviewBodyProps) {
  return (
    <>
      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li key={review.reviewId}>
            <ReviewCard review={review} currentAuthId={currentAuthId} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
      {reviews.length === 0 && (
        <p className="py-10 text-center text-sm text-light-gray">아직 리뷰가 없어요.</p>
      )}
      {!compact && hasMore && (
        <button onClick={onLoadMore} className="w-full mt-4 h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors">
          리뷰 더 보기
        </button>
      )}
      {compact && hasMore && onViewAll && (
        <button onClick={onViewAll} className="w-full mt-3 h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors">
          리뷰 더보기
        </button>
      )}
    </>
  );
}

'use client';

import type { ReviewListProps } from '@/types/seller/review';
import ReviewCard from './ReviewCard';

export default function ReviewList({
  reviews,
  onReplyClick,
  onReportClick,
  onImageClick,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-center text-sm text-light-gray py-16">등록된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.reviewId}
          review={review}
          onReplyClick={onReplyClick}
          onReportClick={onReportClick}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

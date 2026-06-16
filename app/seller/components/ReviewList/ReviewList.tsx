'use client';

import type { ReviewListProps } from '@/types/seller/review';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import ReviewCard from './ReviewCard';

export default function ReviewList({
  reviews,
  onReplyClick,
  onReportClick,
  onImageClick,
}: ReviewListProps) {
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    reviews,
    5
  );

  return (
    <div className="flex flex-col gap-3">
      {paginated.length === 0 ? (
        <p className="text-center text-sm text-light-gray py-16">등록된 리뷰가 없습니다.</p>
      ) : (
        paginated.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReplyClick={onReplyClick}
            onReportClick={onReportClick}
            onImageClick={onImageClick}
          />
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}

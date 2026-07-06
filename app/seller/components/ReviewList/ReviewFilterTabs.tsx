'use client';

import type { ReviewFilterTabsProps, ReviewTabFilter } from '@/types/seller/review';

const TAB_OPTIONS: ReviewTabFilter[] = ['전체', '답변 대기', '별점 높은 순', '사진 리뷰'];
const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function ReviewFilterTabs({
  filter,
  onFilterChange,
  ratingFilter,
  onRatingChange,
}: ReviewFilterTabsProps) {
  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* 탭 필터 */}
      <div className="flex gap-1.5 flex-wrap">
        {TAB_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onFilterChange(option)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === option
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 별점 필터 */}
      <div className="flex gap-1.5 max-mobile:flex-wrap">
        {RATING_OPTIONS.map((rating) => (
          <button
            key={rating}
            onClick={() => onRatingChange(ratingFilter === rating ? undefined : rating)}
            className={`px-3 py-1.5 max-mobile:px-2 rounded-full text-sm font-medium transition-colors ${
              ratingFilter === rating
                ? 'bg-yellow-400 text-white border-yellow-400'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {'★'.repeat(rating)} {rating}점
          </button>
        ))}
      </div>
    </div>
  );
}

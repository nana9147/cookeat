'use client'

import { Card, CardContent } from '@/components/ui/card';
import type { ReviewSummaryCardsProps } from '@/types/seller/review';
import { MessageCircleMore, Star } from 'lucide-react';

export default function ReviewSummaryCards({
  summary,
  filter,
  sortOrder,
  onResetFilter,
  onPendingReplyClick,
  onSortToggle,
}: ReviewSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 max-tablet:grid-cols-2 max-mobile:grid-cols-1">
      <Card
        className={`border-border shadow-sm cursor-pointer transition-colors ${
          filter === '전체' && !sortOrder ? 'ring-2 ring-primary' : 'hover:bg-beige/30'
        }`}
        onClick={onResetFilter}
      >
        <CardContent className="pt-5 pb-5 max-mobile:pt-4 max-mobile:pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">전체 리뷰</p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Star size={15} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl max-mobile:text-xl font-bold text-dark-text">{summary.totalCount}건</p>
        </CardContent>
      </Card>

      <Card
        className={`border-border shadow-sm cursor-pointer transition-colors ${
          sortOrder ? 'ring-2 ring-primary' : 'hover:bg-beige/30'
        }`}
        onClick={onSortToggle}
      >
        <CardContent className="pt-5 pb-5 max-mobile:pt-4 max-mobile:pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">
              평균 평점
              {sortOrder && (
                <span className="ml-1 text-xs text-primary">
                  {sortOrder === 'rating_desc' ? '↓ 높은순' : '↑ 낮은순'}
                </span>
              )}
            </p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Star size={15} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl max-mobile:text-xl font-bold text-dark-text">{summary.averageRating}</p>
            <span className="text-yellow-400 text-lg tracking-tight">
              {'★'.repeat(Math.round(summary.averageRating))}
              {'☆'.repeat(5 - Math.round(summary.averageRating))}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border-border shadow-sm cursor-pointer transition-colors ${
          filter === '답변 대기' ? 'ring-2 ring-primary' : 'hover:bg-beige/30'
        }`}
        onClick={onPendingReplyClick}
      >
        <CardContent className="pt-5 pb-5 max-mobile:pt-4 max-mobile:pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">답변 대기</p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <MessageCircleMore size={15} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl max-mobile:text-xl font-bold text-dark-text">{summary.pendingReplyCount}건</p>
        </CardContent>
      </Card>
    </div>
  );
}

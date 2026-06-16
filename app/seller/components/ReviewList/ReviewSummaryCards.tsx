import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReviewSummaryCardsProps } from '@/types/seller/review';
import { MessageCircleMore, Star } from 'lucide-react';

export default function ReviewSummaryCards({ summary }: ReviewSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* 전체 리뷰 */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">전체 리뷰</p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Star size={15} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-text">{summary.totalCount}건</p>
        </CardContent>
      </Card>

      {/* 평균 평점 */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">평균 평점</p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Star size={15} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-dark-text">{summary.averageRating}</p>
            <span className="text-yellow-400 text-lg tracking-tight">
              {'★'.repeat(Math.round(summary.averageRating))}
              {'☆'.repeat(5 - Math.round(summary.averageRating))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 답변 대기 */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-text">답변 대기</p>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <MessageCircleMore size={15} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark-text">{summary.pendingReplyCount}건</p>
        </CardContent>
      </Card>
    </div>
  );
}

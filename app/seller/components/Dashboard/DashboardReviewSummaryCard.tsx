import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Link from 'next/link';
import type { DashboardReviewSummaryCardProps } from '@/types/seller/dashboard';

export default function DashboardReviewSummaryCard({ review }: DashboardReviewSummaryCardProps) {
  const { totalCount, averageRating, pendingReplyCount } = review;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h5 font-semibold text-dark-text">리뷰 현황</CardTitle>
          <Link
            href="/seller/reviews"
            className="text-xs text-light-gray hover:text-gray-text transition-colors"
          >
            전체보기 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6 max-mobile:pt-4">
        <div className="flex items-center gap-2 mb-5 max-mobile:mb-4">
          <Star size={18} className="text-yellow fill-yellow" />
          <p className="text-2xl font-bold text-dark-text">{averageRating.toFixed(1)}</p>
          <p className="text-xs text-light-gray">전체 {totalCount}건</p>
        </div>

        <div className="rounded-xl bg-beige/50 p-4 max-mobile:p-3 border border-border">
          <p className="text-xs text-light-gray mb-1">답글 미작성</p>
          <p className="text-xl font-bold text-dark-text">{pendingReplyCount}건</p>
        </div>
      </CardContent>
    </Card>
  );
}

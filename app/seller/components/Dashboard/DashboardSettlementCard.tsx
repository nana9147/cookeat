import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { DashboardSettlementCardProps } from '@/types/seller/dashboard';

export default function DashboardSettlementCard({ settlement }: DashboardSettlementCardProps) {
  const { scheduledTotal, nextSettlementDate } = settlement;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h5 font-semibold text-dark-text">정산 정보</CardTitle>
          <Link
            href="/seller/settlements"
            className="text-xs text-light-gray hover:text-gray-text transition-colors"
          >
            전체보기 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 max-mobile:pt-4 max-mobile:space-y-4">
        <div>
          <p className="text-xs text-light-gray mb-2">다음 정산 예정 금액</p>
          <p className="text-2xl font-bold text-dark-text leading-none">
            {scheduledTotal.toLocaleString()}원
          </p>
        </div>

        <div className="h-px bg-border" />

        <div>
          <p className="text-xs text-light-gray mb-2">다음 정산일</p>
          <p className="text-lg font-semibold text-dark-text">
            {nextSettlementDate ?? '예정된 정산 없음'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

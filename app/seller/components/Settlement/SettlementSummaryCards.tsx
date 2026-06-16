'use client';

import type { SettlementSummaryCardsProps } from '@/types/seller/settlement';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Percent, Truck } from 'lucide-react';

export default function SettlementSummaryCards({
  settlementAmount,
  settlementCount,
  commission,
  commissionRate,
  shippingFee,
}: SettlementSummaryCardsProps) {
  return (
    <dl className="grid grid-cols-3 gap-4 mb-6">
      {/*  이번 달 총 정산 */}
      <Card className="border-border shadow-sm">
        <CardContent className="py-2">
          <div className="flex items-center justify-between mb-3">
            <dt className="text-sm text-gray-text">이번 달 총 정산</dt>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <TrendingUp size={15} className="text-primary" />
            </div>
          </div>
          <dd className="text-2xl font-bold text-dark-text">
            {settlementAmount.toLocaleString()}원
          </dd>
          <p className="text-xs text-light-gray mt-3">이번 달 ({settlementCount}회)</p>
        </CardContent>
      </Card>

      {/* 평균 수수료율 */}
      <Card className="border-border shadow-sm">
        <CardContent className="py-2">
          <div className="flex items-center justify-between mb-3">
            <dt className="text-sm text-gray-text">평균 수수료율</dt>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Percent size={15} className="text-primary" />
            </div>
          </div>
          <dd className="text-2xl font-bold text-dark-text">{commissionRate}%</dd>
          <p className="text-xs text-light-gray mt-3">판매액의 {commissionRate}%</p>
        </CardContent>
      </Card>

      {/*  물류 비용 */}
      <Card className="border-border shadow-sm">
        <CardContent className="py-2">
          <div className="flex items-center justify-between mb-3">
            <dt className="text-sm text-gray-text">물류 비용</dt>
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
              <Truck size={15} className="text-primary" />
            </div>
          </div>
          <dd className="text-2xl font-bold text-dark-text">{shippingFee.toLocaleString()}원</dd>
          <p className="text-xs text-light-gray mt-3">이번 달 누적</p>
        </CardContent>
      </Card>
    </dl>
  );
}

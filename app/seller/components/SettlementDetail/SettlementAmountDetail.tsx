'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SettlementDetailProps } from '@/types/seller/settlement';

export default function SettlementAmountDetail({ detail }: SettlementDetailProps) {
  const refundCount = detail.orders.filter(
    (o) => o.status === '취소' || o.status === '환불'
  ).length;

  return (
    <Card className="border-border shadow-sm mb-4">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold text-dark-text mb-4">정산 금액 상세</h2>
        <dl className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-text">총 판매액 (주문 {detail.orders.length}건)</dt>
            <dd className="text-sm font-medium text-dark-text">
              {detail.amountDetail.totalSalesAmount.toLocaleString()}원
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-text">취소/환불 차감 ({refundCount}건)</dt>
            <dd className="text-sm font-medium text-red">
              -{detail.amountDetail.refundAmount.toLocaleString()}원
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-text">
              플랫폼 수수료 ({detail.amountDetail.commissionRate}%)
            </dt>
            <dd className="text-sm font-medium text-red">
              -{detail.amountDetail.commission.toLocaleString()}원
            </dd>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <dt className="text-base font-semibold text-dark-text">최종 정산 금액</dt>
            <dd className="text-xl font-bold text-dark-text">
              {detail.amountDetail.finalAmount.toLocaleString()}원
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

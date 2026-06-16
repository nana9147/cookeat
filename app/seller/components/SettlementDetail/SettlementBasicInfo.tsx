import { Card, CardContent } from '@/components/ui/card';
import type { SettlementDetailProps } from '@/types/seller/settlement';
import StatusBadge from '../StatusBadge';

export default function SettlementBasicInfo({ detail }: SettlementDetailProps) {
  return (
    <Card className="border-border shadow-sm mb-4">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold text-dark-text mb-4">정산 기본 정보</h2>

        <dl className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">정산 기간</dt>
            <dd className="text-sm font-medium text-dark-text">
              {detail.period} ({detail.periodRange})
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">정산일</dt>
            <dd className="text-sm font-medium text-dark-text">{detail.settlementDate}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">정산 상태</dt>
            <dd>
              <StatusBadge status={detail.status} />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">정산 방법</dt>
            <dd className="text-sm font-medium text-dark-text">{detail.paymentMethod}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

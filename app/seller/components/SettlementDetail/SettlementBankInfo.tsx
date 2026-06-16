import { Card, CardContent } from '@/components/ui/card';
import type { SettlementDetailProps } from '@/types/seller/settlement';

export default function SettlementBankInfo({ detail }: SettlementDetailProps) {
  return (
    <Card className="border-border shadow-sm mb-4">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold text-dark-text mb-4">입금 정보</h2>
        <dl className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">입금 은행</dt>
            <dd className="text-sm font-medium text-dark-text">{detail.bankInfo.bankName}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">계좌 번호</dt>
            <dd className="text-sm font-medium text-dark-text">{detail.bankInfo.accountNumber}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs text-light-gray">예금주</dt>
            <dd className="text-sm font-medium text-dark-text">{detail.bankInfo.accountHolder}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

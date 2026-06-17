import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SellerApplicationProps } from '@/types/seller/seller';

export default function SellerBankInfo({ data, isEditing, onChange }: SellerApplicationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">정산 계좌 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-[160px_1fr] items-center">
            <dt className="text-sm text-gray-400">은행명</dt>
            <dd className="text-sm text-gray-800">
              {isEditing ? (
                <Input
                  value={data.bank_name}
                  onChange={(e) => onChange({ bank_name: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                data.bank_name
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center">
            <dt className="text-sm text-gray-400">계좌번호</dt>
            <dd className="text-sm text-gray-800">
              {isEditing ? (
                <Input
                  value={data.bank_account}
                  onChange={(e) => onChange({ bank_account: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                data.bank_account
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

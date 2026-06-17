import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SellerApplicationProps } from '@/types/seller/seller';

export default function SellerBusinessInfo({ data, isEditing, onChange }: SellerApplicationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">사업자 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-[160px_1fr] items-center">
            <dt className="text-sm text-gray-400">사업자 등록번호</dt>
            <dd className="text-sm text-gray-800">{data.business_number}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center">
            <dt className="text-sm text-gray-400">사업장 주소</dt>
            <dd className="text-sm text-gray-800">
              {isEditing ? (
                <Input
                  value={data.business_address ?? ''}
                  onChange={(e) => onChange({ business_address: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                (data.business_address ?? '-')
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryInfo } from '@/types/seller/order';

export default function OrderDeliverySection({ delivery }: { delivery: DeliveryInfo }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>배송 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-[120px_1fr]">
            <dt className="text-sm text-gray-400">수령인</dt>
            <dd className="text-sm text-gray-800">{delivery.name}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr]">
            <dt className="text-sm text-gray-400">연락처</dt>
            <dd className="text-sm text-gray-800">{delivery.phone}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr]">
            <dt className="text-sm text-gray-400">배송주소</dt>
            <dd className="text-sm text-gray-800">
              {delivery.address}, {delivery.addressDetail}
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr]">
            <dt className="text-sm text-gray-400">배송 요청사항</dt>
            <dd className="text-sm text-gray-800">{delivery.memo}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

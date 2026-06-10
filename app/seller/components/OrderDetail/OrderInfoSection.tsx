'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderInfoSectionProps } from '@/types/seller/order';
import StatusBadge from '../StatusBadge';

export default function OrderInfoSection({ info, name }: OrderInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>주문 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="grid grid-cols-2 gap-y-5">
          <div>
            <dt className="text-xs text-gray-400 mb-2">주문자</dt>
            <dd className="text-sm text-gray-800">{name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 mb-2">주문상태</dt>
            <dd>
              <StatusBadge status={info.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 mb-2">주문번호</dt>
            <dd className="text-sm text-gray-800">{info.id}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 mb-2">주문일시</dt>
            <dd className="text-sm text-gray-800">{info.orderDate}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

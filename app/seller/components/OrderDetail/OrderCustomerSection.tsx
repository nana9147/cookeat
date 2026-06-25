'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryInfo, OrderInfoSectionProps } from '@/types/seller/order';
import { User, MapPin, Phone, MessageSquare } from 'lucide-react';

interface OrderCustomerSectionProps {
  customerName: OrderInfoSectionProps['name'];
  delivery: DeliveryInfo;
}

export default function OrderCustomerSection({
  customerName,
  delivery,
}: OrderCustomerSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-400" />
            주문자 / 수령인
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">주문자</dt>
              <dd className="text-gray-800">{customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">수령인</dt>
              <dd className="text-gray-800">{delivery.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                연락처
              </dt>
              <dd className="text-gray-800">{delivery.phone}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            배송지
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-800">
            {delivery.address}, {delivery.addressDetail}
          </p>
          {delivery.memo && (
            <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5 bg-gray-50 rounded-md px-2.5 py-2">
              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {delivery.memo}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

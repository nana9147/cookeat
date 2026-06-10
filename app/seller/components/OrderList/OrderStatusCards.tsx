'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { OrderStatusCardsProps } from '@/types/seller/order';

const colorMap: Record<string, string> = {
  결제완료: 'text-green-500',
  배송준비중: 'text-yellow-500',
  배송중: 'text-blue-500',
  배송완료: 'text-taupe-500',
  '취소/환불': 'text-red-500',
};

export default function OrderStatusCards({ cards, status, onStatusChange }: OrderStatusCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-5">
      {cards.map((item) => (
        <Card
          key={item.label}
          className={`cursor-pointer ${status === item.filterValue ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            const newFilter = item.filterValue as import('@/types/seller/order').OrderStatusFilter;
            onStatusChange(status === newFilter ? '전체' : newFilter);
          }}
        >
          <CardContent className="py-2">
            <p className="text-sm text-gray-500 mb-2">{item.label}</p>
            <p className={`text-2xl font-bold ${colorMap[item.label] ?? 'text-gray-800'}`}>
              {item.count}건
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

'use client';

import { OrderInfo, PAYMENT_LABEL, PaymentMethod } from '@/types/seller/order';
import { CreditCard } from 'lucide-react';
import StatusBadge from '../StatusBadge';

interface OrderDetailHeaderProps {
  info: OrderInfo;
  paymentMethod: PaymentMethod;
}

export default function OrderDetailHeader({ info, paymentMethod }: OrderDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <p className="text-sm font-mono text-gray-800 font-medium">{info.id}</p>
        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
          <span>{new Date(info.orderDate).toLocaleString()} 주문</span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            {PAYMENT_LABEL[paymentMethod]}
          </span>
        </p>
      </div>
      <StatusBadge status={info.status} />
    </div>
  );
}

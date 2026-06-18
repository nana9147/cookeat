'use client';

import { useSearchParams } from 'next/navigation';
import CartStepper from '@/components/(auth)/cart/CartStepper';
import PaymentResult from './PaymentResult';
import { usePaymentConfirm } from './usePaymentConfirm';
import type { PaymentType } from './completeData';

export default function Complete() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const pgToken = searchParams.get('pg_token');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));

  const { status, orderDetail } = usePaymentConfirm(paymentKey, pgToken, orderId, amount);
  const paymentMethod: PaymentType = pgToken ? 'kakao' : 'card';

  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2
        className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2"
        suppressHydrationWarning
      >
        주문 완료
      </h2>
      <CartStepper />
      <div className="mt-6">
        <PaymentResult status={status} paymentMethod={paymentMethod} orderDetail={orderDetail} />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import CartStepper from '@/components/(auth)/cart/CartStepper';
import PaymentSummary from '@/components/(auth)/cart/PaymentSummary';
import DeliverInfo from './DeliveryInfo';
import OrderItems from './OrderItems';
import PaymentMethod from './PaymentMethod';
import OrderAgreement from './OrderAgreement';
import { useCheckoutPayment } from './useCheckoutPayment';

export default function Checkout() {
  const [allAgreed, setAllAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [finalAmount, setFinalAmount] = useState(0);
  const handlePay = useCheckoutPayment(paymentMethod, finalAmount);

  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2
        className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2"
        suppressHydrationWarning
      >
        주문/결제
      </h2>
      <CartStepper />
      <div className="flex flex-col desktop:flex-row gap-6 desktop:gap-10 desktop:items-start">
        <div className="flex-1 min-w-0">
          <DeliverInfo />
          <OrderItems />
          <PaymentMethod onPaymentChange={setPaymentMethod} />
          <OrderAgreement onAgreementChange={setAllAgreed} />
        </div>
        <div className="w-full desktop:w-80 desktop:sticky desktop:top-6 shrink-0">
          <PaymentSummary mode="checkout" allAgreed={allAgreed} onPay={handlePay} onAmountChange={setFinalAmount} />
        </div>
      </div>
    </div>
  );
}

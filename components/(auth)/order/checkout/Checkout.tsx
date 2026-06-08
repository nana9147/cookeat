'use client';

import CartStepper from '@/components/(auth)/order/CartStepper';

export default function Checkout() {
  return (
    <>
      <h2 className="text-h2 font-bold desktop:text-h2" suppressHydrationWarning>주문서 작성</h2>
      <CartStepper />
    </>
  );
}

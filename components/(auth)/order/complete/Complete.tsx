'use client';

import CartStepper from '@/components/(auth)/order/CartStepper';

export default function Complete() {
  return (
    <>
      <h2 className="text-h2 font-bold desktop:text-h2" suppressHydrationWarning>결제 완료</h2>
      <CartStepper />
    </>
  );
}

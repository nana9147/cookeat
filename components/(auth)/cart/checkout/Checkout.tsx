'use client';

import { useState, useMemo } from 'react';
import CartStepper from '@/components/(auth)/cart/CartStepper';
import PaymentSummary from '@/components/(auth)/cart/PaymentSummary';
import DeliverInfo, { SelectedAddress } from './DeliveryInfo';
import OrderItems from './OrderItems';
import PaymentMethod from './PaymentMethod';
import OrderAgreement from './OrderAgreement';
import DiscountSection, { AppliedCoupon } from './DiscountSection';
import { useCheckoutPayment } from './useCheckoutPayment';
import { useCartItems } from '../useCartItems';
import { useCartStore } from '@/store/cartStore';
import { calcShipping } from '@/lib/shipping';

export default function Checkout() {
  const [allAgreed, setAllAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryInfo, setDeliveryInfo] = useState<SelectedAddress | null>(null);
  const [usedPoint, setUsedPoint] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const checkoutItems = useCartStore((s) => s.checkoutItems);
  const { items, storeItems, loading } = useCartItems();

  // checkoutItems: 장바구니에서 선택한 항목 (비어있으면 전체로 폴백)
  const baseStoreItems = checkoutItems.length > 0 ? checkoutItems : storeItems;
  const availableStoreItems = useMemo(
    () => baseStoreItems.filter((s) => items.find((i) => i.productId === s.productId)?.available),
    [baseStoreItems, items]
  );
  const orderItems = useMemo(
    () =>
      items
        .filter((i) => i.available && availableStoreItems.some((s) => s.productId === i.productId))
        .map((i) => {
          const s = availableStoreItems.find((c) => c.productId === i.productId);
          return s ? { ...i, quantity: s.quantity } : i;
        }),
    [items, availableStoreItems]
  );
  const totalAmount = useMemo(
    () => orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [orderItems]
  );
  const shippingFee = calcShipping(totalAmount);

  const couponDiscount = appliedCoupon?.discountAmount ?? 0;

  const [paying, setPaying] = useState(false);
  const doHandlePay = useCheckoutPayment(
    paymentMethod,
    availableStoreItems,
    deliveryInfo,
    usedPoint,
    appliedCoupon?.code ?? null
  );
  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try { await doHandlePay(); }
    finally { setPaying(false); }
  };

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
          <DeliverInfo onAddressSelect={setDeliveryInfo} />
          <OrderItems items={orderItems} loading={loading} />
          <DiscountSection
            orderTotal={totalAmount}
            usedPoint={usedPoint}
            onPointChange={setUsedPoint}
            appliedCoupon={appliedCoupon}
            onCouponApply={setAppliedCoupon}
          />
          <PaymentMethod onPaymentChange={setPaymentMethod} />
          <OrderAgreement onAgreementChange={setAllAgreed} />
        </div>
        <div className="w-full desktop:w-80 desktop:sticky desktop:top-6 shrink-0">
          <PaymentSummary
            mode="checkout"
            allAgreed={allAgreed}
            paying={paying}
            onPay={handlePay}
            productTotal={totalAmount}
            shippingFee={shippingFee}
            couponDiscount={couponDiscount}
            usedPoint={usedPoint}
            productDiscount={0}
          />
        </div>
      </div>
    </div>
  );
}

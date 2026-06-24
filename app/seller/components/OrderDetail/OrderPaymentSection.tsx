'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COUPON_DISCOUNT_TYPE_LABEL, PAYMENT_LABEL, PaymentInfo } from '@/types/seller/order';

export default function OrderPaymentSection({ payment }: { payment: PaymentInfo }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>결제 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <dt className="text-sm text-gray-500">상품 금액</dt>
            <dd className="text-sm text-gray-800">{payment.totalPrice.toLocaleString()}원</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-sm text-gray-500">배송비</dt>
            <dd className="text-sm text-gray-800">+ {payment.shippingFee.toLocaleString()}원</dd>
          </div>
          {payment.couponDiscount > 0 && (
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-500 flex items-center gap-2">
                쿠폰 할인
                {payment.couponCode && (
                  <span className="text-xs text-primary bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {payment.couponCode}
                    {payment.couponDiscountType && payment.couponDiscountValue !== null && (
                      <>
                        {' '}
                        ({payment.couponDiscountValue}
                        {COUPON_DISCOUNT_TYPE_LABEL[payment.couponDiscountType]} 할인)
                      </>
                    )}
                  </span>
                )}
              </dt>
              <dd className="text-sm text-red-500">
                - {payment.couponDiscount.toLocaleString()}원
              </dd>
            </div>
          )}
          {payment.pointAmount > 0 && (
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-500">포인트 사용</dt>
              <dd className="text-sm text-red-500">- {payment.pointAmount.toLocaleString()}원</dd>
            </div>
          )}
        </dl>

        <div className="border-t border-dashed border-gray-200 my-4" />

        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-semibold text-gray-800">최종 결제 금액</span>
          <span className="text-xl font-bold text-primary">
            {payment.finalAmount.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
          <span className="text-sm text-gray-500">결제 수단</span>
          <span className="text-sm font-medium text-gray-800">
            {PAYMENT_LABEL[payment.paymentMethod]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

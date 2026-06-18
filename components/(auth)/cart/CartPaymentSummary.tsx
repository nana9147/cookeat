'use client';

import { Truck } from 'lucide-react';

type Props = {
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  itemCount: number;
  onCheckout: () => void;
};

export default function CartPaymentSummary({ totalAmount, shippingFee, finalAmount, itemCount, onCheckout }: Props) {
  const earnPoints = Math.floor(finalAmount * 0.01);

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-h5 font-bold text-dark-text">결제 요약</h3>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-text">상품 금액 ({itemCount}개)</span>
          <span className="text-dark-text font-medium">{totalAmount.toLocaleString()}원</span>
        </div>
        {totalAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-text">배송비</span>
            <span className="text-dark-text font-medium">
              {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <h4 className="text-sm font-medium text-dark-text">총 결제 금액</h4>
          <span className="text-2xl font-bold text-primary">{finalAmount.toLocaleString()}원</span>
        </div>
        <p className="text-right text-xs text-gray-text">+ {earnPoints.toLocaleString()}P 적립 예정</p>
      </div>

      {itemCount > 0 ? (
        <button
          type="button"
          onClick={onCheckout}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold text-base py-4 rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
        >
          주문하기 &gt;
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="w-full bg-muted text-white font-semibold text-base py-4 rounded-xl text-center cursor-not-allowed"
        >
          상품을 선택해주세요
        </button>
      )}

      <div className="flex items-start gap-1.5 text-xs text-gray-text leading-relaxed">
        <Truck className="w-3.5 h-3.5 text-primary shrink-0 mt-px" />
        <span>3만원 이상 무료배송 · 오늘 14시 전 결제 시 내일 새벽 도착예정입니다.</span>
      </div>
    </div>
  );
}

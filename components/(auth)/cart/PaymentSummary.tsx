'use client';

import Link from 'next/link';

interface PaymentSummaryProps {
  mode?: 'checkout' | 'complete';
  noCard?: boolean;
  paymentMethodLabel?: string;
  allAgreed?: boolean;
  paying?: boolean;
  onPay?: () => void;
  productTotal?: number;
  productDiscount?: number;
  couponDiscount?: number;
  usedPoint?: number;
  shippingFee?: number;
}

export default function PaymentSummary({
  mode = 'checkout',
  noCard = false,
  paymentMethodLabel,
  allAgreed = false,
  paying = false,
  onPay,
  productTotal = 0,
  productDiscount = 0,
  couponDiscount = 0,
  usedPoint = 0,
  shippingFee = 0,
}: PaymentSummaryProps) {
  const finalAmount = Math.max(0, productTotal - productDiscount - couponDiscount - usedPoint + shippingFee);
  const rows = [
    { label: '상품 금액', value: `${productTotal.toLocaleString()}원`, red: false },
    ...(productDiscount > 0
      ? [{ label: '상품 할인', value: `-${productDiscount.toLocaleString()}원`, red: true }]
      : []),
    ...(couponDiscount > 0
      ? [{ label: '쿠폰 할인', value: `-${couponDiscount.toLocaleString()}원`, red: true }]
      : []),
    ...(usedPoint > 0
      ? [{ label: '포인트 사용', value: `-${usedPoint.toLocaleString()}원`, red: true }]
      : []),
    { label: '배송비', value: shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`, red: false },
  ];

  // noCard: 카드 래퍼 없이 rows만 렌더링 (complete 페이지 왼쪽 카드의 결제 정보 섹션에 사용)
  if (noCard) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        {paymentMethodLabel && (
          <div className="flex justify-between">
            <span className="text-gray-text">결제 수단</span>
            <span className="text-dark-text">{paymentMethodLabel}</span>
          </div>
        )}
        {rows.map(({ label, value, red }) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-text">{label}</span>
            <span className={`font-medium ${red ? 'text-red' : 'text-dark-text'}`}>{value}</span>
          </div>
        ))}
        <hr className="border-border" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-dark-text">결제 금액</span>
          <span className="text-h4 font-bold text-dark-text">{finalAmount.toLocaleString()}원</span>
        </div>
      </div>
    );
  }

  // 기본 standalone 카드 모드 (checkout 우측 사이드바)
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4">
      <h3 className="text-h4 font-bold text-dark-text">최종 결제 금액</h3>
      <div className="flex flex-col gap-3 text-sm">
        {rows.map(({ label, value, red }) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-text">{label}</span>
            <span className={`font-medium ${red ? 'text-red' : 'text-dark-text'}`}>{value}</span>
          </div>
        ))}
      </div>
      <hr className="border-border" />
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-dark-text">결제 금액</span>
          <span className="text-h3 font-bold text-primary">{finalAmount.toLocaleString()}원</span>
        </div>
      </div>
      {mode === 'checkout' && (
        <button
          type="button"
          onClick={onPay}
          disabled={!allAgreed || paying}
          className="w-full font-semibold text-base py-4 rounded-xl flex items-center justify-center gap-1 transition-colors disabled:cursor-not-allowed bg-primary hover:bg-primary-hover text-white disabled:bg-muted"
        >
          {paying ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기 >`}
        </button>
      )}
      <div className="flex items-start gap-2 border border-primary/30 bg-primary/5 rounded-xl px-3 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7" stroke="#3B6E47" strokeWidth="1.2" />
          <path d="M5 8l2 2 4-4" stroke="#3B6E47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-gray-text leading-relaxed">결제 후 주문 내역은 마이페이지에서 확인 가능합니다.</p>
      </div>
      <div className="flex flex-col gap-1 text-xs text-light-gray">
        <p>* 오늘 14시 전 결제 시 내일 새벽 도착합니다.</p>
        <p>* 신선식품 특성상 배송 후 교환/환불이 어려울 수 있습니다.</p>
      </div>
      {mode === 'checkout' && (
        <Link href="/cart" className="w-full border border-border rounded-xl py-3 text-sm text-gray-text font-medium text-center hover:bg-hover transition-colors">
          장바구니로 돌아가기
        </Link>
      )}
    </div>
  );
}

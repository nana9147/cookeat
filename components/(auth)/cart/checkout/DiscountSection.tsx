'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import CouponModal from './CouponModal';

export interface AppliedCoupon {
  couponId: number;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

interface DiscountSectionProps {
  orderTotal: number;
  usedPoint: number;
  onPointChange: (point: number) => void;
  appliedCoupon: AppliedCoupon | null;
  onCouponApply: (coupon: AppliedCoupon | null) => void;
}

export default function DiscountSection({
  orderTotal,
  usedPoint,
  onPointChange,
  appliedCoupon,
  onCouponApply,
}: DiscountSectionProps) {
  const [pointBalance, setPointBalance] = useState(0);
  const [pointInput, setPointInput] = useState('');
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const initialFetched = useRef(false);

  useEffect(() => {
    if (initialFetched.current) return;
    initialFetched.current = true;
    api.get<{ balance: number }>('/users/me/points').then(({ data }) => {
      setPointBalance(data.balance);
    });
  }, []);

  const maxUsablePoint = Math.min(pointBalance, orderTotal);

  function handlePointInput(value: string) {
    const numeric = value.replace(/\D/g, '');
    setPointInput(numeric);
    const parsed = parseInt(numeric || '0', 10);
    onPointChange(Math.min(parsed, maxUsablePoint));
  }

  function applyAllPoints() {
    onPointChange(maxUsablePoint);
    setPointInput(String(maxUsablePoint));
  }

  function clearPoints() {
    onPointChange(0);
    setPointInput('');
  }

  function handleCouponRemove() {
    onCouponApply(null);
  }

  return (
    <section className="bg-white rounded-2xl border border-border p-5 mb-4">
      <h3 className="text-base font-bold text-dark-text mb-4">할인 적용</h3>

      {/* 포인트 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-dark-text">포인트</span>
          <span className="text-xs text-gray-text">
            보유: <span className="text-primary font-semibold">{pointBalance.toLocaleString()}P</span>
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={pointInput}
              onChange={(e) => handlePointInput(e.target.value)}
              placeholder="사용할 포인트 입력"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-text">P</span>
          </div>
          <button
            type="button"
            onClick={applyAllPoints}
            disabled={maxUsablePoint === 0}
            className="shrink-0 px-3 py-2.5 text-xs font-semibold border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            전액 사용
          </button>
          <button
            type="button"
            onClick={clearPoints}
            className="shrink-0 px-3 py-2.5 text-xs font-semibold border border-border text-gray-text rounded-lg hover:bg-hover transition-colors"
          >
            초기화
          </button>
        </div>
        {usedPoint > 0 && (
          <p className="mt-1.5 text-xs text-primary">{usedPoint.toLocaleString()}P 적용됨</p>
        )}
        {maxUsablePoint === 0 && pointBalance > 0 && (
          <p className="mt-1.5 text-xs text-gray-text">주문 금액이 부족하여 포인트를 사용할 수 없습니다.</p>
        )}
      </div>

      {/* 쿠폰 */}
      <div>
        <span className="text-sm font-semibold text-dark-text block mb-2">쿠폰</span>
        {appliedCoupon ? (
          <div className="flex items-center justify-between border border-primary/40 bg-primary/5 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary">{appliedCoupon.code}</p>
              <p className="text-xs text-gray-text mt-0.5">
                {appliedCoupon.discountType === 'rate'
                  ? `${appliedCoupon.discountValue}% 할인`
                  : `${appliedCoupon.discountValue.toLocaleString()}원 할인`}
                {' — '}
                <span className="text-red font-medium">-{appliedCoupon.discountAmount.toLocaleString()}원</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCouponRemove}
              className="text-xs text-gray-text hover:text-dark-text transition-colors ml-4 shrink-0"
            >
              제거
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCouponModalOpen(true)}
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-gray-text hover:border-primary hover:text-primary transition-colors text-left"
          >
            쿠폰 선택하기
          </button>
        )}
      </div>

      <CouponModal
        open={couponModalOpen}
        orderTotal={orderTotal}
        onClose={() => setCouponModalOpen(false)}
        onSelect={onCouponApply}
      />
    </section>
  );
}

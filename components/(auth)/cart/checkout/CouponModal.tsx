'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import type { AppliedCoupon } from './DiscountSection';

interface CouponItem {
  userCouponId: number;
  couponId: number;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number | null;
  expiredAt: string;
  usable: boolean;
}

interface CouponModalProps {
  open: boolean;
  orderTotal: number;
  onClose: () => void;
  onSelect: (coupon: AppliedCoupon) => void;
}

function formatDiscount(c: CouponItem) {
  return c.discountType === 'rate' ? `${c.discountValue}% 할인` : `${c.discountValue.toLocaleString()}원 할인`;
}

function formatExpiry(expiredAt: string) {
  return new Date(expiredAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CouponModal({ open, orderTotal, onClose, onSelect }: CouponModalProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetchCoupons = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ coupons: CouponItem[] }>('/coupons/mine', {
          params: { amount: orderTotal },
        });
        if (!cancelled) setCoupons(data.coupons);
      } catch {
        if (!cancelled) setError('쿠폰 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCoupons();

    return () => {
      cancelled = true;
    };
  }, [open, orderTotal]);

  function handleSelect(c: CouponItem) {
    onSelect({
      userCouponId: c.userCouponId,
      couponId: c.couponId,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      discountAmount: c.discountAmount,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>쿠폰 선택</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-beige animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red text-center py-6">{error}</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-gray-text text-center py-6">사용 가능한 쿠폰이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto py-1 pr-1">
            {coupons.map((c) => (
              <li key={c.userCouponId}>
                <button
                  type="button"
                  disabled={!c.usable}
                  onClick={() => handleSelect(c)}
                  className={[
                    'w-full text-left border rounded-xl px-4 py-3.5 transition-colors',
                    c.usable
                      ? 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                      : 'border-border bg-beige opacity-50 cursor-not-allowed',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-semibold text-dark-text truncate">{c.code}</p>
                      <p className="text-xs text-primary font-medium">{formatDiscount(c)}</p>
                      {c.minOrderAmount !== null && (
                        <p className="text-xs text-gray-text">
                          최소 주문 {c.minOrderAmount.toLocaleString()}원
                          {!c.usable && ' (금액 부족)'}
                        </p>
                      )}
                      <p className="text-xs text-gray-text">~{formatExpiry(c.expiredAt)} 까지</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-red whitespace-nowrap">
                      -{c.discountAmount.toLocaleString()}원
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

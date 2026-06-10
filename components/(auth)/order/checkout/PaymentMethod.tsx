'use client';

import { useState } from 'react';
import { Card, Kakaopay, Tosspay, Bankbook, MobilePayment } from './CheckoutIcons';

type PaymentType = 'card' | 'kakao' | 'toss' | 'bankbook' | 'mobile';

const PAYMENT_OPTIONS: { id: PaymentType; label: string; icon: React.ReactNode }[] = [
  { id: 'card', label: '신용/체크카드', icon: <Card /> },
  { id: 'kakao', label: '카카오페이', icon: <Kakaopay /> },
  { id: 'toss', label: '토스페이', icon: <Tosspay /> },
  { id: 'bankbook', label: '무통장입금', icon: <Bankbook /> },
  { id: 'mobile', label: '휴대폰결제', icon: <MobilePayment /> },
];

interface PaymentMethodProps {
  onPaymentChange?: (method: PaymentType) => void;
}

export default function PaymentMethod({ onPaymentChange }: PaymentMethodProps) {
  const [selected, setSelected] = useState<PaymentType>('card');

  const handleSelect = (method: PaymentType) => {
    setSelected(method);
    onPaymentChange?.(method);
  };

  return (
    <section className="py-6 border-b border-border">
      <h3 className="text-h4 font-bold text-dark-text mb-4">결제 수단</h3>

      {/* 결제 수단 선택 버튼 */}
      <div className="grid grid-cols-5 gap-2 tablet:gap-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-colors ${
                isSelected
                  ? 'border-primary bg-hover text-primary'
                  : 'border-border bg-white text-gray-text'
              }`}
            >
              {option.icon}
              <span className="text-2xs desktop:text-xs text-center leading-tight">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

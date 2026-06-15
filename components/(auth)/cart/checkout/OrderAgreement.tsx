'use client';

import { useState } from 'react';

const AGREEMENTS = [
  { id: 'agree1', label: '구매하기 전 및 결제 관련 동의' },
  { id: 'agree2', label: '개인정보 수집 이용 동의' },
  { id: 'agree3', label: '카드뉴스케어 이용 동의' },
  { id: 'agree4', label: '개인정보 제3자 제공 동의' },
];

interface OrderAgreementProps {
  onAgreementChange: (allAgreed: boolean) => void;
}

export default function OrderAgreement({ onAgreementChange }: OrderAgreementProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    all: false,
    agree1: false,
    agree2: false,
    agree3: false,
    agree4: false,
  });

  const handleAll = (value: boolean) => {
    const next: Record<string, boolean> = { all: value };
    AGREEMENTS.forEach((a) => (next[a.id] = value));
    setChecked(next);
    onAgreementChange(value);
  };

  const handleSingle = (id: string, value: boolean) => {
    const next = { ...checked, [id]: value };
    next.all = AGREEMENTS.every((a) => next[a.id]);
    setChecked(next);
    onAgreementChange(next.all);
  };

  return (
    <section className="py-6">
      <h3 className="text-h4 font-bold text-dark-text mb-4">주문 동의</h3>

      {/* 전체 동의 */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked.all}
          onChange={(e) => handleAll(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm font-semibold text-dark-text">전체 동의</span>
      </label>

      <div className="flex flex-col gap-2 pl-1">
        {AGREEMENTS.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checked[item.id]}
                onChange={(e) => handleSingle(item.id, e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-xs text-dark-text">
                <span className="text-primary font-medium">[필수]</span> {item.label}
              </span>
            </label>
            <button
              type="button"
              className="text-xs text-light-gray underline underline-offset-2 shrink-0 ml-2"
            >
              보기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

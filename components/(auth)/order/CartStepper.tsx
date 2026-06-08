'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { label: '장바구니', path: '/cart' },
  { label: '주문서 작성', path: '/cart/checkout' },
  { label: '결제 완료', path: '/cart/complete' },
];

export default function CartStepper() {
  const pathname = usePathname();
  const currentStep = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="flex flex-nowrap items-center justify-center gap-1.5 tablet:gap-3 py-4 tablet:py-6">
      {STEPS.map((step, index) => (
        <div key={step.path} className="flex items-center gap-1.5 tablet:gap-2">
          <div className="flex items-center gap-1 tablet:gap-1.5">
            <span
              className={`w-5 h-5 tablet:w-6 tablet:h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                index === currentStep
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 text-gray-400'
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-xs tablet:text-sm whitespace-nowrap ${
                index === currentStep ? 'text-dark-text font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <span className="text-gray-300 text-xs">{'>'}</span>
          )}
        </div>
      ))}
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { label: '장바구니', path: '/order' },
  { label: '주문서 작성', path: '/order/checkout' },
  { label: '결제 완료', path: '/order/complete' },
];

export default function CartStepper() {
  const pathname = usePathname();
  const currentStep = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {STEPS.map((step, index) => (
        <div key={step.path} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                index === currentStep
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 text-gray-400'
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-h5 ${
                index === currentStep ? 'text-dark-text font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <span className="text-gray-300 text-sm">{'>'}</span>
          )}
        </div>
      ))}
    </div>
  );
}

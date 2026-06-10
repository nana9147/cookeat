import Link from 'next/link';
import PaymentSummary from '@/components/(auth)/order/PaymentSummary';

type Status = 'loading' | 'success' | 'fail';

export default function PaymentResult({ status }: { status: Status }) {
  if (status === 'loading') {
    return <p className="py-20 text-center text-gray-text">결제 확인 중...</p>;
  }

  if (status === 'fail') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-h4 font-bold text-dark-text">결제에 실패했습니다.</p>
        <Link href="/cart/checkout" className="px-6 py-3 border border-border rounded-xl text-sm text-gray-text hover:bg-hover transition-colors">
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col desktop:flex-row gap-6 desktop:gap-10 desktop:items-start mt-6">
      <div className="flex-1 flex flex-col items-center gap-4 py-10 bg-white rounded-2xl border border-border">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#3B6E47" strokeWidth="2" />
          <path d="M14 24l7 7 13-14" stroke="#3B6E47" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-h4 font-bold text-dark-text">결제가 완료되었습니다!</p>
        <p className="text-sm text-gray-text">주문 내역은 마이페이지에서 확인할 수 있습니다.</p>
        <Link href="/" className="mt-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
          홈으로 가기
        </Link>
      </div>
      <div className="w-full desktop:w-80 shrink-0">
        <PaymentSummary mode="complete" />
      </div>
    </div>
  );
}

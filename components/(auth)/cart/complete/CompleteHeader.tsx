import Link from 'next/link';
import { ORDER_INFO } from './completeData';

export default function CompleteHeader() {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 desktop:p-10 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M7 14l5 5 9-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-h3 desktop:text-h2 font-bold text-dark-text">주문이 완료되었습니다!</p>
      <p className="text-sm text-gray-text">오늘 14시 전 완료되었습니다. 내일 새벽에 배송받을 수 있어요.</p>
      <div className="flex items-center gap-6 mt-1">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-text">주문번호</span>
          <span className="text-sm font-semibold text-dark-text">{ORDER_INFO.orderId}</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-text">일시</span>
          <span className="text-sm font-semibold text-dark-text">{ORDER_INFO.date}</span>
        </div>
      </div>
      <Link
        href="/mypage/orders"
        className="mt-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors"
      >
        주문 내역 보기 &gt;
      </Link>
    </div>
  );
}

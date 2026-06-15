import Link from 'next/link';
import { ITEMS, FINAL_AMOUNT } from './completeData';

export default function CompleteOrderItems() {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-border p-5 flex flex-col gap-5">
      <section>
        <h3 className="text-h4 font-bold text-dark-text mb-4">
          주문 상품 <span className="text-sm font-normal text-gray-text">{ITEMS.length}개</span>
        </h3>
        <div className="flex flex-col gap-4">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-card-bg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-text mb-0.5">{item.seller}</p>
                <p className="text-sm font-medium text-dark-text truncate">{item.name}</p>
                <p className="text-xs text-light-gray">{item.quantity}개</p>
              </div>
              <span className="text-sm font-semibold text-dark-text shrink-0">
                {item.price.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border" />

      <section className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-dark-text">총 상품 금액</span>
          <span className="text-h4 font-bold text-dark-text">{FINAL_AMOUNT.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/mypage/orders"
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl text-center transition-colors"
          >
            주문 내역 보기 &gt;
          </Link>
          <Link
            href="/"
            className="w-full py-3 border border-border rounded-xl text-sm text-gray-text font-medium text-center hover:bg-hover transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </section>
    </div>
  );
}

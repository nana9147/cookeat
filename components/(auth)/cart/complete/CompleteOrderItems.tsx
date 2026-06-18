import Image from 'next/image';
import Link from 'next/link';
import type { OrderDetail } from './types';

export default function CompleteOrderItems({ orderDetail }: { orderDetail: OrderDetail | null }) {
  const items = orderDetail?.items ?? [];
  const finalAmount = orderDetail?.finalAmount ?? 0;

  return (
    <div className="flex-1 bg-white rounded-2xl border border-border p-5 flex flex-col gap-5">
      <section>
        <h3 className="text-h4 font-bold text-dark-text mb-4">
          주문 상품 <span className="text-sm font-normal text-gray-text">{items.length}개</span>
        </h3>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg bg-card-bg shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-card-bg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-text mb-0.5">{item.seller}</p>
                <p className="text-sm font-medium text-dark-text truncate">{item.name}</p>
                <p className="text-xs text-light-gray">{item.quantity}개</p>
              </div>
              <span className="text-sm font-semibold text-dark-text shrink-0">
                {(item.unitPrice * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-border" />

      <section className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-dark-text">최종 결제 금액</span>
          <span className="text-h4 font-bold text-primary">{finalAmount.toLocaleString()}원</span>
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

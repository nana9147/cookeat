import Image from 'next/image';
import type { MergedCartItem } from '../useCartItems';

type Props = { items: MergedCartItem[]; loading: boolean };

export default function OrderItems({ items, loading }: Props) {
  if (loading) {
    return (
      <section className="py-6 border-b border-border">
        <h3 className="text-h4 font-bold text-dark-text mb-4">주문 상품</h3>
        <p className="text-sm text-gray-text">불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="py-6 border-b border-border">
      <h3 className="text-h4 font-bold text-dark-text mb-4">
        주문 상품{' '}
        <span className="text-sm font-normal text-gray-text">{items.length}개</span>
      </h3>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative w-15 h-15 desktop:w-18 desktop:h-18 rounded-lg bg-card-bg shrink-0 overflow-hidden">
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
              {(item.price * item.quantity).toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

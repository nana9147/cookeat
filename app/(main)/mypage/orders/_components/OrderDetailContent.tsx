import Image from 'next/image';
import { formatDate, formatWon } from '@/lib/format';
import type { OrderDetail } from './types';

const STATUS_STYLE: Record<string, string> = {
  결제전: 'bg-muted/30 text-gray-text',
  결제완료: 'bg-primary/10 text-primary',
  주문확인: 'bg-blue-50 text-blue-600',
  배송준비: 'bg-yellow/10 text-yellow-600',
  배송중: 'bg-orange-50 text-orange-500',
  배송완료: 'bg-gray-100 text-gray-500',
  취소: 'bg-red/10 text-red',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-text">{label}</span>
      <span className="text-xs text-dark-text">{value}</span>
    </div>
  );
}

export default function OrderDetailContent({ detail }: { detail: OrderDetail }) {
  return (
    <>
      {/* 주문 기본 정보 */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-text">{formatDate(detail.createdAt)}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[detail.status] ?? 'bg-muted/30 text-gray-text'}`}>
            {detail.status}
          </span>
        </div>
        <p className="text-xs text-muted">{detail.orderId}</p>
      </section>

      {/* 주문 상품 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-dark-text">주문 상품</h3>
        <ul className="flex flex-col gap-3">
          {detail.items.map((item) => (
            <li key={item.itemId} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl bg-card-bg shrink-0 overflow-hidden">
                {item.image
                  ? <Image src={item.image} alt={item.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                      </svg>
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-text truncate">{item.name}</p>
                <p className="text-xs text-gray-text mt-0.5">{item.quantity}개 · {formatWon(item.unitPrice)}</p>
              </div>
              <span className="text-sm font-semibold text-dark-text shrink-0">{formatWon(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 결제 정보 */}
      <section className="flex flex-col gap-2 rounded-xl bg-beige px-4 py-3">
        <h3 className="text-sm font-semibold text-dark-text mb-1">결제 정보</h3>
        <InfoRow label="상품 금액" value={formatWon(detail.totalAmount)} />
        <InfoRow label="배송비" value={detail.shippingFee === 0 ? '무료' : formatWon(detail.shippingFee)} />
        {detail.usedPoint > 0 && <InfoRow label="포인트 사용" value={`-${formatWon(detail.usedPoint)}`} />}
        {detail.couponDiscount > 0 && <InfoRow label="쿠폰 할인" value={`-${formatWon(detail.couponDiscount)}`} />}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <span className="text-sm font-bold text-dark-text">최종 결제 금액</span>
          <span className="text-base font-bold text-primary">{formatWon(detail.finalAmount)}</span>
        </div>
        <p className="text-xs text-gray-text">{detail.paymentMethod}</p>
      </section>

      {/* 배송지 정보 */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-dark-text">배송지 정보</h3>
        <p className="text-sm text-dark-text">{detail.shipping.recipient} · {detail.shipping.phone}</p>
        <p className="text-sm text-gray-text">
          {detail.shipping.address}{detail.shipping.addressDetail && ` ${detail.shipping.addressDetail}`}
        </p>
        {detail.shipping.request && <p className="text-xs text-muted">요청사항: {detail.shipping.request}</p>}
      </section>

      {/* 배송 추적 */}
      {detail.trackings.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-dark-text">배송 정보</h3>
          <ul className="flex flex-col gap-2">
            {detail.trackings.map((t, idx) => (
              <li key={idx} className="flex flex-col gap-0.5 rounded-xl border border-border px-4 py-3">
                {t.carrier && <p className="text-sm text-dark-text">{t.carrier}</p>}
                {t.trackingNumber && <p className="text-xs text-gray-text">운송장: {t.trackingNumber}</p>}
                {t.shippedAt && <p className="text-xs text-gray-text">출고: {formatDate(t.shippedAt)}</p>}
                {t.deliveredAt && <p className="text-xs text-gray-text">배송완료: {formatDate(t.deliveredAt)}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

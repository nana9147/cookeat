import Image from 'next/image';
import type { Order } from './types';
import OrderCardActions from './OrderCardActions';
import { formatDate, formatWon } from '@/lib/format';

type Props = {
  order: Order;
  onDetailClick: () => void;
  onCancelRequested?: () => void;
  onRefundRequested?: () => void;
};

const STATUS_STYLE: Record<string, string> = {
  결제전: 'bg-muted/30 text-gray-text',
  결제완료: 'bg-primary/10 text-primary',
  주문확인: 'bg-blue-50 text-blue-600',
  배송준비: 'bg-yellow/10 text-yellow-600',
  배송중: 'bg-orange-50 text-orange-500',
  배송완료: 'bg-gray-100 text-gray-500',
  취소: 'bg-red/10 text-red',
  환불: 'bg-red/10 text-red',
};

export default function OrderCard({ order, onDetailClick, onCancelRequested, onRefundRequested }: Props) {
  const displayStatus = order.hasPendingCancelRequest
    ? '취소 신청됨'
    : order.hasPendingRefundRequest
      ? '환불 신청됨'
      : order.status;
  const statusStyle = order.hasPendingCancelRequest || order.hasPendingRefundRequest
    ? STATUS_STYLE['취소']
    : STATUS_STYLE[order.status] ?? 'bg-muted/30 text-gray-text';
  const extraCount = order.itemCount - order.previewItems.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-beige">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-text shrink-0">{formatDate(order.createdAt)}</span>
          <span className="text-xs text-muted shrink-0">|</span>
          <span className="text-xs font-medium text-dark-text truncate">{order.orderId}</span>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle}`}>{displayStatus}</span>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        {order.previewItems.map((item) => (
          <div key={item.itemId} className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl bg-card-bg shrink-0 overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-text truncate">{item.name}</p>
              <p className="text-xs text-gray-text mt-0.5">{item.quantity}개</p>
            </div>
            <span className="text-sm font-semibold text-dark-text shrink-0">
              {formatWon(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
        {extraCount > 0 && <p className="text-xs text-gray-text text-center py-1">외 {extraCount}개 상품 더보기</p>}
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-gray-text">
            <span>{order.paymentMethod}</span>
            <span className="text-border">|</span>
            <span>배송비 {order.shippingFee === 0 ? '무료' : formatWon(order.shippingFee)}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-text">총</span>
            <span className="text-base font-bold text-primary">{formatWon(order.finalAmount)}</span>
          </div>
        </div>
        <OrderCardActions
          order={order}
          onDetailClick={onDetailClick}
          onCancelRequested={onCancelRequested}
          onRefundRequested={onRefundRequested}
        />
      </div>
    </div>
  );
}

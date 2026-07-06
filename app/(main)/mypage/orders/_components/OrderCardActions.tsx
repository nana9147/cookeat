'use client';

import { useState } from 'react';
import type { Order } from './types';
import OrderReviewModal from './OrderReviewModal';
import OrderCancelModal from './OrderCancelModal';
import OrderRefundModal from './OrderRefundModal';
import OrderInquiryModal from './OrderInquiryModal';

type Props = {
  order: Order;
  onDetailClick: () => void;
  onCancelRequested?: () => void;
  onRefundRequested?: () => void;
};

export default function OrderCardActions({
  order,
  onDetailClick,
  onCancelRequested,
  onRefundRequested,
}: Props) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={onDetailClick}
          className="flex-1 h-9 flex items-center justify-center rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors"
        >
          주문 상세
        </button>
        <button
          onClick={() => setShowInquiryModal(true)}
          className="flex-1 h-9 flex items-center justify-center rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors"
        >
          문의하기
        </button>
        {order.status === '배송완료' && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 h-9 flex items-center justify-center rounded-xl border border-primary text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            리뷰 작성
          </button>
        )}
        {order.status === '배송완료' && (
          <button
            onClick={() => setShowRefundModal(true)}
            disabled={order.hasPendingRefundRequest}
            className="flex-1 h-9 flex items-center justify-center rounded-xl border border-red/20 text-sm text-red font-medium hover:bg-red/5 transition-colors disabled:text-red/40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            {order.hasPendingRefundRequest ? '환불 신청됨' : '환불 신청'}
          </button>
        )}
        {(order.status === '결제완료' || order.status === '주문확인') && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={order.hasPendingCancelRequest}
            className="flex-1 h-9 flex items-center justify-center rounded-xl border border-red/20 text-sm text-red font-medium hover:bg-red/5 transition-colors disabled:text-red/40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            {order.hasPendingCancelRequest ? '취소 신청됨' : '취소 신청'}
          </button>
        )}
      </div>

      {showReviewModal && (
        <OrderReviewModal
          orderId={order.orderId}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {showCancelModal && (
        <OrderCancelModal
          orderId={order.orderId}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            onCancelRequested?.();
          }}
        />
      )}

      {showRefundModal && (
        <OrderRefundModal
          orderId={order.orderId}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            setShowRefundModal(false);
            onRefundRequested?.();
          }}
        />
      )}

      {showInquiryModal && (
        <OrderInquiryModal
          orderId={order.orderId}
          onClose={() => setShowInquiryModal(false)}
        />
      )}
    </>
  );
}

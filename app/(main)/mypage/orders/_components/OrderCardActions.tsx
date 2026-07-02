'use client';

import { useState } from 'react';
import type { Order } from './types';
import OrderReviewModal from './OrderReviewModal';

type Props = { order: Order; onDetailClick: () => void };

export default function OrderCardActions({ order, onDetailClick }: Props) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={onDetailClick}
          className="flex-1 h-9 flex items-center justify-center rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors"
        >
          주문 상세
        </button>
        {order.status === '배송완료' && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 h-9 flex items-center justify-center rounded-xl border border-primary text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            리뷰 작성
          </button>
        )}
        {(order.status === '결제완료' || order.status === '주문확인') && (
          <button
            disabled
            title="준비 중"
            className="flex-1 h-9 flex items-center justify-center rounded-xl border border-red/20 text-sm text-red/40 font-medium cursor-not-allowed"
          >
            취소 신청
          </button>
        )}
      </div>

      {showReviewModal && (
        <OrderReviewModal
          orderId={order.orderId}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}

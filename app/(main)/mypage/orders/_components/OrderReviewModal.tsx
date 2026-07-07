'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import ReviewWriteModal from '@/components/common/ReviewWriteModal';
import { OrderItemReviewRow } from './OrderItemReviewRow';
import { useOrderReviewModal } from '@/hooks/useOrderReviewModal';

type ReviewTarget = { productId: number; itemId: number; name: string };

export default function OrderReviewModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { detail, loading, reviewed, markReviewed } = useOrderReviewModal(orderId, onClose);
  const [writeTarget, setWriteTarget] = useState<ReviewTarget | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90dvh] flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
            <h2 className="font-bold text-dark-text">리뷰 작성</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
              <X className="w-5 h-5 text-gray-text" />
            </button>
          </div>
          <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4 pb-8 flex flex-col gap-4">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-beige animate-pulse" />)
            ) : !detail ? (
              <p className="py-10 text-center text-sm text-gray-text">주문 정보를 불러오지 못했습니다.</p>
            ) : (
              <>
                <p className="text-xs text-gray-text">구매하신 상품에 리뷰를 남겨주세요.</p>
                {detail.items.map((item) => (
                  <OrderItemReviewRow
                    key={item.itemId}
                    itemId={item.itemId}
                    name={item.name}
                    image={item.image}
                    quantity={item.quantity}
                    done={reviewed.has(item.itemId)}
                    onWrite={() => setWriteTarget({ productId: item.productId, itemId: item.itemId, name: item.name })}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {writeTarget && (
        <ReviewWriteModal
          type="product"
          targetId={writeTarget.productId}
          targetName={writeTarget.name}
          orderItemId={writeTarget.itemId}
          onClose={() => setWriteTarget(null)}
          onSuccess={() => { markReviewed(writeTarget.itemId); setWriteTarget(null); }}
        />
      )}
    </>
  );
}

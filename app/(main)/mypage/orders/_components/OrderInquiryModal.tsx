'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import InquiryWriteModal from '@/components/common/InquiryWriteModal';
import { OrderItemInquiryRow } from './OrderItemInquiryRow';
import { useOrderInquiryModal } from '@/hooks/useOrderInquiryModal';

type InquiryTarget = { orderItemId: number; name: string };

export default function OrderInquiryModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { detail, loading } = useOrderInquiryModal(orderId, onClose);
  const [writeTarget, setWriteTarget] = useState<InquiryTarget | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90dvh] flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
            <h2 className="font-bold text-dark-text">주문 상품 문의</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
              <X className="w-5 h-5 text-gray-text" />
            </button>
          </div>
          <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4 pb-8 flex flex-col gap-4">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-beige animate-pulse" />)
            ) : !detail ? (
              <p className="py-10 text-center text-sm text-gray-text">주문 정보를 불러오지 못했습니다.</p>
            ) : submitted ? (
              <p className="py-10 text-center text-sm text-gray-text">
                문의가 등록되었습니다. 마이페이지 &gt; 고객센터에서 확인하실 수 있어요.
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-text">문의할 상품을 선택해주세요.</p>
                {detail.items.map((item) => (
                  <OrderItemInquiryRow
                    key={item.itemId}
                    name={item.name}
                    image={item.image}
                    quantity={item.quantity}
                    onInquire={() => setWriteTarget({ orderItemId: item.itemId, name: item.name })}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {writeTarget && (
        <InquiryWriteModal
          target="orderItem"
          orderItemId={writeTarget.orderItemId}
          targetName={writeTarget.name}
          onClose={() => setWriteTarget(null)}
          onSuccess={() => setSubmitted(true)}
        />
      )}
    </>
  );
}

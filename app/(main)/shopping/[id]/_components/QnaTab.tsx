'use client';

import { useState } from 'react';
import InquiryWriteModal from '@/components/common/InquiryWriteModal';
import { useProductQna } from '@/hooks/useProductQna';
import { formatDateTime } from '@/lib/format';

interface QnaTabProps {
  productId: number;
  productName: string;
}

export function QnaTab({ productId, productName }: QnaTabProps) {
  const { qnas, loading, refresh } = useProductQna(productId);
  const [showWriteModal, setShowWriteModal] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-beige animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {qnas.length === 0 ? (
        <p className="text-sm text-gray-text text-center py-10">등록된 상품 문의가 없습니다.</p>
      ) : (
        qnas.map((qna) => (
          <div key={qna.inquiryId} className="bg-card rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
                Q
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-dark-text">{qna.title}</span>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      qna.isAnswered ? 'bg-primary/10 text-primary' : 'bg-border text-muted'
                    }`}
                  >
                    {qna.isAnswered ? '답변완료' : '답변대기'}
                  </span>
                </div>
                <p className="text-sm text-gray-text">{qna.content}</p>
                <p className="text-xs text-light-gray mt-1">
                  {qna.isMine ? `${qna.author} (나)` : qna.author} · {formatDateTime(qna.createdAt)}
                </p>
              </div>
            </div>
            {qna.reply && (
              <div className="flex items-start gap-3 pl-2 border-l-2 border-primary/30">
                <span className="shrink-0 w-5 h-5 rounded-full bg-beige text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  A
                </span>
                <div>
                  <p className="text-sm text-gray-text leading-relaxed">{qna.reply.content}</p>
                  <p className="text-xs text-light-gray mt-1">판매자 · {formatDateTime(qna.reply.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
      <button
        onClick={() => setShowWriteModal(true)}
        className="w-full h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
      >
        문의하기
      </button>

      {showWriteModal && (
        <InquiryWriteModal
          target="product"
          productId={productId}
          targetName={productName}
          onClose={() => setShowWriteModal(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

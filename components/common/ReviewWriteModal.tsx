'use client';

import { X } from 'lucide-react';
import { StarRatingInput } from './StarRatingInput';
import { useReviewWriteForm } from '@/hooks/useReviewWriteForm';
import type { ApiReview } from './ReviewCard';

interface ReviewWriteModalProps {
  type: 'recipe' | 'product';
  targetId: number;
  targetName?: string;
  orderItemId?: number;
  existingReview?: Pick<ApiReview, 'reviewId' | 'rating' | 'content'>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewWriteModal(props: ReviewWriteModalProps) {
  const { targetName, onClose } = props;
  const { isEdit, rating, setRating, hoverRating, setHoverRating, content, setContent, submitting, error, handleSubmit } = useReviewWriteForm(props);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="font-bold text-dark-text">{isEdit ? '리뷰 수정' : '리뷰 작성'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5">
          {targetName && <p className="text-sm text-gray-text">{targetName}</p>}
          <StarRatingInput rating={rating} hoverRating={hoverRating} onRate={setRating} onHover={setHoverRating} onLeave={() => setHoverRating(0)} />
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 상품에 대한 솔직한 리뷰를 남겨주세요."
              maxLength={500}
              rows={5}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm text-dark-text placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted text-right mt-1">{content.length}/500</p>
          </div>
          {error && <p className="text-sm text-red text-center">{error}</p>}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors">취소</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {submitting ? '등록 중...' : isEdit ? '수정 완료' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

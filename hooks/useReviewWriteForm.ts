'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { ApiReview } from '@/components/common/ReviewCard';

interface Options {
  type: 'recipe' | 'product';
  targetId: number;
  orderItemId?: number;
  existingReview?: Pick<ApiReview, 'reviewId' | 'rating' | 'content'>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useReviewWriteForm({
  type,
  targetId,
  orderItemId,
  existingReview,
  onSuccess,
  onClose,
}: Options) {
  const isEdit = !!existingReview;
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const basePath =
    type === 'recipe' ? `/recipes/${targetId}/reviews` : `/products/${targetId}/reviews`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSubmit() {
    if (rating === 0) { setError('별점을 선택해주세요'); return; }
    if (!content.trim()) { setError('리뷰 내용을 입력해주세요'); return; }
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await api.patch(`${basePath}/${existingReview.reviewId}`, { rating, content });
      } else {
        const body: Record<string, unknown> = { rating, content };
        if (type === 'product' && orderItemId) body.orderItemId = orderItemId;
        await api.post(basePath, body);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      type ApiErr = { response?: { data?: { error?: string } } };
      setError((err as ApiErr)?.response?.data?.error ?? '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    isEdit, rating, setRating, hoverRating, setHoverRating,
    content, setContent, submitting, error, handleSubmit,
  };
}

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { OrderDetail } from '@/app/(main)/mypage/orders/_components/types';

export function useOrderReviewModal(orderId: string, onClose: () => void) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .get<OrderDetail>(`/orders/${orderId}`)
      .then(({ data }) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function markReviewed(itemId: number) {
    setReviewed((prev) => new Set(prev).add(itemId));
  }

  return { detail, loading, reviewed, markReviewed };
}

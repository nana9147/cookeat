'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export type ProductQna = {
  inquiryId: number;
  title: string;
  content: string;
  author: string;
  isMine: boolean;
  isAnswered: boolean;
  reply: { content: string; createdAt: string } | null;
  createdAt: string;
};

export function useProductQna(productId: number) {
  const [qnas, setQnas] = useState<ProductQna[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQna = useCallback(() => {
    return api
      .get<{ inquiries: ProductQna[] }>(`/products/${productId}/inquiries`)
      .then(({ data }) => setQnas(data.inquiries))
      .catch(() => setQnas([]))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { fetchQna(); }, [fetchQna]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchQna();
  }, [fetchQna]);

  return { qnas, loading, refresh };
}

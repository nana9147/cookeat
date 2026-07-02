'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ApiReview } from '@/components/common/ReviewCard';

export interface ReviewsResponse {
  reviews: ApiReview[];
  totalCount: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface Options {
  type: 'recipe' | 'product';
  targetId: number;
  compact: boolean;
}

const LIMIT = 10;
const COMPACT_LIMIT = 2;

export function useReviewSection({ type, targetId, compact }: Options) {
  const user = useAuthStore((s) => s.user);
  const currentAuthId = user?.userId ?? undefined;

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [allReviews, setAllReviews] = useState<ApiReview[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [writeModal, setWriteModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiReview | null>(null);

  const limit = compact ? COMPACT_LIMIT : LIMIT;
  const basePath = type === 'recipe' ? `/recipes/${targetId}/reviews` : `/products/${targetId}/reviews`;

  useEffect(() => {
    let cancelled = false;
    api.get<ReviewsResponse>(basePath, { params: { page: 1, limit } })
      .then(({ data: res }) => {
        if (cancelled) return;
        setData(res);
        setAllReviews(res.reviews ?? []);
        setHasMore(limit < res.totalCount);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, type, refreshKey]);

  function refresh() {
    setLoading(true);
    setAllReviews([]);
    setRefreshKey((k) => k + 1);
  }

  async function handleLoadMore() {
    const next = page + 1;
    try {
      const res = await api.get<ReviewsResponse>(basePath, { params: { page: next, limit } });
      setAllReviews((prev) => [...prev, ...(res.data.reviews ?? [])]);
      setHasMore(next * limit < res.data.totalCount);
      setPage(next);
    } catch { /* silent */ }
  }

  async function handleDelete(reviewId: number) {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    try { await api.delete(`${basePath}/${reviewId}`); refresh(); }
    catch { alert('삭제에 실패했습니다.'); }
  }

  const myReview = currentAuthId
    ? allReviews.find((r) => r.authId === currentAuthId) : undefined;
  const canWrite = type === 'recipe' && !!user && !myReview;
  const totalCount = data?.totalCount ?? 0;

  return {
    data, allReviews, hasMore, loading, currentAuthId,
    canWrite, totalCount, writeModal, editTarget,
    setWriteModal, setEditTarget, refresh, handleLoadMore, handleDelete,
  };
}

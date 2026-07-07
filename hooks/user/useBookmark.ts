'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useBookmark(recipeId: number) {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get<{ isActive: boolean; count: number }>(`/recipes/${recipeId}/bookmark`)
      .then(({ data }) => { setIsActive(data.isActive); setCount(data.count); })
      .catch(() => {});
  }, [recipeId, isLoggedIn]);

  const toggle = async () => {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ isActive: boolean; count: number }>(`/recipes/${recipeId}/bookmark`);
      setIsActive(data.isActive);
      setCount(data.count);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setLoading(false);
    }
  };

  return { isActive, count, toggle, loading };
}

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useWishlist(productId: number) {
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get<{ isActive: boolean }>(`/products/${productId}/wishlist`)
      .then(({ data }) => setIsActive(data.isActive))
      .catch(() => {});
  }, [productId, isLoggedIn]);

  const toggle = async () => {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ isActive: boolean }>(`/products/${productId}/wishlist`);
      setIsActive(data.isActive);
    } catch {
      // 실패 시 상태 유지
    } finally {
      setLoading(false);
    }
  };

  return { isActive, toggle, loading };
}

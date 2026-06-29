'use client';

import { useLayoutEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSellerViewStore } from '@/store/sellerViewStore';

export default function SellerAdminViewInitializer() {
  const role = useAuthStore((s) => s.user?.role);
  const setViewAsSellerId = useSellerViewStore((s) => s.setViewAsSellerId);

  useLayoutEffect(() => {
    if (role !== 'admin') return;
    const sellerIdStr = new URLSearchParams(window.location.search).get('sellerId');
    if (sellerIdStr) {
      setViewAsSellerId(Number(sellerIdStr));
    }
  }, [role, setViewAsSellerId]);

  useLayoutEffect(() => {
    return () => setViewAsSellerId(null);
  }, [setViewAsSellerId]);

  return null;
}

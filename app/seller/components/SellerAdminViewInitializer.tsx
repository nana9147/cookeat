'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSellerViewStore } from '@/store/sellerViewStore';

export default function SellerAdminViewInitializer() {
  const role = useAuthStore((s) => s.user?.role);
  const searchParams = useSearchParams();
  const setViewAsSellerId = useSellerViewStore((s) => s.setViewAsSellerId);

  useEffect(() => {
    if (role !== 'admin') return;
    const sellerIdStr = searchParams.get('sellerId');
    if (sellerIdStr) {
      setViewAsSellerId(Number(sellerIdStr));
    }
  }, [role, searchParams, setViewAsSellerId]);

  // 셀러 레이아웃 이탈 시 초기화
  useEffect(() => {
    return () => setViewAsSellerId(null);
  }, [setViewAsSellerId]);

  return null;
}

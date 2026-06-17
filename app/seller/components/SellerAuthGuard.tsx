'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SellerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!isSeller) {
      alert('판매자만 접근할 수 있는 페이지입니다.');
      router.replace('/');
    }
  }, [hydrated, token, isSeller, router]);

  if (!hydrated) return null;
  if (!token || !isSeller) return null;
  return <>{children}</>;
}

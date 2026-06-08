'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function MypageGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, _hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hydrated) return;
    if (!accessToken) {
      alert('로그인 후 사용가능합니다.');
      router.replace('/login');
    }
  }, [_hydrated, accessToken, router]);

  if (!_hydrated || !accessToken) return null;
  return <>{children}</>;
}

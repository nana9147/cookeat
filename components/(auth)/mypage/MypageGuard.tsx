'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function MypageGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, _hydrated } = useAuthStore();
  const router = useRouter();
  const wasAuthed = useRef(false);

  useEffect(() => {
    if (!_hydrated) return;
    if (accessToken) {
      wasAuthed.current = true;
      return;
    }
    // 처음부터 미인증 상태로 접근한 경우에만 /login으로 리다이렉트
    // 로그아웃으로 토큰이 사라진 경우(wasAuthed = true)에는 로그아웃 핸들러가 처리
    if (!wasAuthed.current) {
      alert('로그인 후 사용가능합니다.');
      router.replace('/login');
    }
  }, [_hydrated, accessToken, router]);

  if (!_hydrated || !accessToken) return null;
  return <>{children}</>;
}

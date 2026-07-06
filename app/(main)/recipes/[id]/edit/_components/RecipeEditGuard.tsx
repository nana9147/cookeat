'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RecipeEditGuard({
  recipeId,
  authorUserId,
  children,
}: {
  recipeId: number;
  authorUserId: number;
  children: React.ReactNode;
}) {
  const { accessToken, user, _hydrated } = useAuthStore();
  const router = useRouter();
  const wasAuthed = useRef(false);

  useEffect(() => {
    if (!_hydrated) return;
    if (!accessToken) {
      if (!wasAuthed.current) {
        alert('로그인 후 사용 가능합니다.');
        router.replace('/login');
      }
      return;
    }
    wasAuthed.current = true;
    if (user?.dbUserId !== authorUserId) {
      alert('본인 레시피만 수정할 수 있습니다.');
      router.replace(`/recipes/${recipeId}`);
    }
  }, [_hydrated, accessToken, user, authorUserId, recipeId, router]);

  if (!_hydrated || !accessToken || user?.dbUserId !== authorUserId) return null;
  return <>{children}</>;
}

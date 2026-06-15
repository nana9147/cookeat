'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s._hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !isAdmin) router.replace('/admin/login');
  }, [hydrated, token, isAdmin, router]);

  if (!hydrated) return null;
  if (!token || !isAdmin) return null;
  return <>{children}</>;
}

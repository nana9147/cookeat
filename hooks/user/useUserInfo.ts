'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface UserInfo {
  nickname: string;
  email: string;
  phone: string;
  profileImage: string | null;
  point: number;
  isSocial: boolean;
}

export function useUserInfo() {
  const { user, accessToken } = useAuthStore();
  const [info, setInfo] = useState<UserInfo>({
    nickname: user?.nickname ?? '',
    email: user?.email ?? '',
    phone: '',
    profileImage: user?.profileImage ?? null,
    point: 0,
    isSocial: user?.isSocial ?? false,
  });

  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((data) =>
        setInfo((prev) => ({
          ...prev,
          point: data.point ?? prev.point,
          email: data.email || prev.email,
          nickname: data.nickname || prev.nickname,
          phone: data.phone ?? '',
          isSocial: data.isSocial ?? prev.isSocial,
        }))
      );
  }, [accessToken]);

  return info;
}

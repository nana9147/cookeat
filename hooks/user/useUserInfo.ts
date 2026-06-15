'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface ApiProfile {
  email?: string;
  nickname?: string;
  phone?: string;
  isSocial?: boolean;
  profileImage?: string | null;
  point?: number;
}

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
  const [apiProfile, setApiProfile] = useState<ApiProfile | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    api.get<ApiProfile>('/auth/profile').then(({ data }) => setApiProfile(data));
  }, [accessToken]);

  return {
    email: apiProfile?.email ?? user?.email ?? '',
    nickname: apiProfile?.nickname ?? user?.nickname ?? '',
    phone: apiProfile?.phone ?? '',
    profileImage: apiProfile?.profileImage ?? user?.profileImage ?? null,
    isSocial: apiProfile?.isSocial ?? user?.isSocial ?? false,
    point: apiProfile?.point ?? 0,
  } satisfies UserInfo;
}

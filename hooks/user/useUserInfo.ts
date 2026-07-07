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
  const profile = accessToken ? apiProfile : null;

  useEffect(() => {
    if (!accessToken) return;
    let ignore = false;

    api.get<ApiProfile>('/auth/profile')
      .then(({ data }) => {
        if (!ignore) setApiProfile(data);
      })
      .catch(() => {
        if (!ignore) setApiProfile(null);
      });

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  return {
    email: profile?.email ?? user?.email ?? '',
    nickname: profile?.nickname ?? user?.nickname ?? '',
    phone: profile?.phone ?? '',
    profileImage: profile?.profileImage ?? user?.profileImage ?? null,
    isSocial: profile?.isSocial ?? user?.isSocial ?? false,
    point: profile?.point ?? 0,
  } satisfies UserInfo;
}

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
  const [point, setPoint] = useState(0);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [isSocial, setIsSocial] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.nickname) setNickname(user.nickname);
    if (user?.isSocial !== undefined) setIsSocial(user.isSocial);
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((data) => {
        setPoint(data.point ?? 0);
        if (data.email) setEmail(data.email);
        if (data.nickname) setNickname(data.nickname);
        setPhone(data.phone ?? '');
        setIsSocial(data.isSocial ?? false);
      });
  }, [accessToken]);

  return {
    nickname,
    email,
    phone,
    profileImage: user?.profileImage ?? null,
    point,
    isSocial,
  } satisfies UserInfo;
}

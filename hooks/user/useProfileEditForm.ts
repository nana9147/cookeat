'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserInfo } from '@/hooks/user/useUserInfo';
import { useNicknameCheck } from '@/hooks/auth/useNicknameCheck';

export function useProfileEditForm() {
  const { email, nickname: initNickname, phone: initPhone, profileImage, isSocial } = useUserInfo();
  const accessToken = useAuthStore((s) => s.accessToken);
  const patchUser = useAuthStore((s) => s.patchUser);
  const { nicknameCheck, setNicknameCheck, isNicknameChecking, checkNickname } = useNicknameCheck();
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setNickname(initNickname); }, [initNickname]);
  useEffect(() => { setPhone(initPhone); }, [initPhone]);
  const handleNicknameChange = (v: string) => { setNickname(v); setNicknameCheck(null); };
  const mismatch = !!(newPw && newPwConfirm && newPw !== newPwConfirm);
  const nicknameChanged = nickname !== initNickname;
  const canSubmit = !mismatch && (!nicknameChanged || nicknameCheck?.ok === true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !accessToken) return;
    setError(null);
    const body: Record<string, string> = { nickname, phone };
    if (!isSocial && currentPw && newPw) Object.assign(body, { currentPassword: currentPw, newPassword: newPw });
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? '수정 중 오류가 발생했습니다.'); return; }
    alert('수정되었습니다.');
    window.location.reload();
  };
  return {
    email, nickname, phone, onPhoneChange: setPhone, profileImage, isSocial,
    accessToken, patchUser,
    nicknameCheck, isNicknameChecking, handleNicknameChange, onNicknameCheck: () => checkNickname(nickname),
    currentPw, setCurrentPw, newPw, setNewPw, newPwConfirm, setNewPwConfirm,
    mismatch, canSubmit, error, handleSubmit,
  };
}

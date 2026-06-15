'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserInfo } from '@/hooks/user/useUserInfo';
import api from '@/lib/api';
import { useNicknameCheck } from '@/hooks/auth/useNicknameCheck';

export function useProfileEditForm() {
  const { email, nickname: initNickname, phone: initPhone, profileImage, isSocial } = useUserInfo();
  const accessToken = useAuthStore((s) => s.accessToken);
  const patchUser = useAuthStore((s) => s.patchUser);
  const { nicknameCheck, setNicknameCheck, isNicknameChecking, checkNickname } = useNicknameCheck();
  const [nicknameOverride, setNicknameOverride] = useState<string | null>(null);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  const nickname = nicknameOverride ?? initNickname;
  const phone = phoneOverride ?? initPhone;
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNicknameChange = (v: string) => { setNicknameOverride(v); setNicknameCheck(null); };
  const mismatch = !!(newPw && newPwConfirm && newPw !== newPwConfirm);
  const nicknameChanged = nickname !== initNickname;
  const canSubmit = !mismatch && (!nicknameChanged || nicknameCheck?.ok === true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !accessToken) return;
    setError(null);
    const body: Record<string, string> = { nickname, phone };
    if (!isSocial && currentPw && newPw) Object.assign(body, { currentPassword: currentPw, newPassword: newPw });
    try {
      await api.patch('/auth/profile', body);
      alert('수정되었습니다.');
      window.location.reload();
    } catch (err) {
      setError((err as Error).message ?? '수정 중 오류가 발생했습니다.');
    }
  };
  return {
    email, nickname, phone, onPhoneChange: setPhoneOverride, profileImage, isSocial,
    accessToken, patchUser,
    nicknameCheck, isNicknameChecking, handleNicknameChange, onNicknameCheck: () => checkNickname(nickname),
    currentPw, setCurrentPw, newPw, setNewPw, newPwConfirm, setNewPwConfirm,
    mismatch, canSubmit, error, handleSubmit,
  };
}

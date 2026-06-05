'use client';

import { useState } from 'react';
import { authService } from '@/services/auth/authService';

type CheckResult = { text: string; ok: boolean };

export function useNicknameCheck() {
  const [nicknameCheck, setNicknameCheck] = useState<CheckResult | null>(null);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);

  const checkNickname = async (nickname: string) => {
    if (!nickname.trim()) return setNicknameCheck({ text: '닉네임을 입력해주세요.', ok: false });
    setIsNicknameChecking(true);
    try {
      const exists = await authService.checkNickname(nickname.trim());
      setNicknameCheck(
        exists ? { text: '이미 사용 중인 닉네임입니다.', ok: false } : { text: '사용 가능한 닉네임입니다.', ok: true },
      );
    } catch {
      setNicknameCheck({ text: '확인 중 오류가 발생했습니다.', ok: false });
    } finally {
      setIsNicknameChecking(false);
    }
  };

  return { nicknameCheck, setNicknameCheck, isNicknameChecking, checkNickname };
}

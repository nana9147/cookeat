'use client';

import { useState } from 'react';
import { getPasswordStrength } from '@/lib/passwordStrength';
import { useNicknameCheck } from './useNicknameCheck';

export function useRegisterFields() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPwc, setShowPwc] = useState(false);
  const [nickname, setNicknameRaw] = useState('');
  const { nicknameCheck, setNicknameCheck, isNicknameChecking, checkNickname } = useNicknameCheck();
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 닉네임 변경 시 중복확인 결과 초기화
  const setNickname = (v: string) => { setNicknameRaw(v); setNicknameCheck(null); };
  const handleNicknameCheck = () => checkNickname(nickname);

  const strength = getPasswordStrength(password);
  const confirmError = passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : null;

  // 닉네임 중복확인 완료 + 강한 비밀번호 + 전화번호 모두 충족해야 제출 가능
  const canSubmit =
    email.trim().length > 0 &&
    nicknameCheck?.ok === true &&
    (strength === 'strong' || strength === 'very-strong') &&
    confirmError === null &&
    passwordConfirm.length > 0 &&
    phone.trim().length > 0 &&
    agreed;

  return {
    email, setEmail,
    password, setPassword, showPw, setShowPw,
    passwordConfirm, setPasswordConfirm, showPwc, setShowPwc,
    nickname, setNickname, nicknameCheck, handleNicknameCheck, isNicknameChecking,
    phone, setPhone, agreed, setAgreed,
    confirmError, canSubmit,
  };
}

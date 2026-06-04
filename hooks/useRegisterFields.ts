'use client';

import { useState } from 'react';
import { getPasswordStrength } from '@/lib/passwordStrength';

// 중복 확인 결과 타입
type CheckResult = { text: string; ok: boolean };

// 이메일 형식 검사 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 회원가입 폼 필드 상태 및 유효성 검사 훅
export function useRegisterFields() {
  const [email, setEmailRaw] = useState('');
  const [emailCheck, setEmailCheck] = useState<CheckResult | null>(null);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPwc, setShowPwc] = useState(false);
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 이메일 변경 시 중복 확인 결과 초기화
  const setEmail = (v: string) => {
    setEmailRaw(v);
    setEmailCheck(null);
  };

  // 이메일 형식 검사 후 중복 확인
  const handleEmailCheck = () => {
    if (!email.trim()) return setEmailCheck({ text: '이메일을 입력해주세요.', ok: false });
    if (!EMAIL_REGEX.test(email)) return setEmailCheck({ text: '올바른 이메일 형식이 아닙니다.', ok: false });
    // TODO: 중복 확인 API 연동
    setEmailCheck({ text: '사용 가능한 이메일입니다.', ok: true });
  };

  const strength = getPasswordStrength(password);
  // 비밀번호 확인 불일치 에러 메시지
  const confirmError = passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : null;
  // 회원가입 버튼 활성화 조건: 이메일 확인 완료 + 강한 비밀번호 + 비밀번호 일치 + 닉네임 + 약관 동의
  const canSubmit =
    emailCheck?.ok &&
    (strength === 'strong' || strength === 'very-strong') &&
    confirmError === null &&
    passwordConfirm.length > 0 &&
    nickname.trim().length > 0 &&
    agreed;

  return {
    email, setEmail, emailCheck, handleEmailCheck,
    password, setPassword, showPw, setShowPw,
    passwordConfirm, setPasswordConfirm, showPwc, setShowPwc,
    nickname, setNickname, agreed, setAgreed,
    confirmError, canSubmit,
  };
}

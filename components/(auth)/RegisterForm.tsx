'use client';

import { useRegisterForm } from '@/hooks/useRegisterForm';
import RegisterFormFields from './RegisterFormFields';

export default function RegisterForm() {
  const {
    email,
    setEmail,
    emailCheck,
    handleEmailCheck,
    password,
    setPassword,
    showPw,
    setShowPw,
    passwordConfirm,
    setPasswordConfirm,
    showPwc,
    setShowPwc,
    nickname,
    setNickname,
    agreed,
    setAgreed,
    confirmError,
    canSubmit,
    submitError,
    isLoading,
    handleSubmit,
  } = useRegisterForm();

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <RegisterFormFields
        email={email}
        onEmailChange={setEmail}
        emailCheckResult={emailCheck}
        onEmailCheck={handleEmailCheck}
        password={password}
        onPasswordChange={setPassword}
        showPassword={showPw}
        onTogglePassword={() => setShowPw((v) => !v)}
        passwordConfirm={passwordConfirm}
        onPasswordConfirmChange={setPasswordConfirm}
        showPasswordConfirm={showPwc}
        onTogglePasswordConfirm={() => setShowPwc((v) => !v)}
        confirmError={confirmError}
        nickname={nickname}
        onNicknameChange={setNickname}
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="accent-primary"
        />
        이용약관 및 개인정보처리방침에 동의합니다
      </label>
      {submitError && <p className="text-xs text-red">{submitError}</p>}
      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
}

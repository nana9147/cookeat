'use client';

import { useRegisterForm } from '@/hooks/auth/useRegisterForm';
import RegisterFormFields from './RegisterFormFields';
import RegisterSubmit from './RegisterSubmit';

export default function RegisterForm() {
  const {
    email, setEmail,
    password, setPassword, showPw, setShowPw,
    passwordConfirm, setPasswordConfirm, showPwc, setShowPwc,
    nickname, setNickname, nicknameCheck, handleNicknameCheck, isNicknameChecking,
    phone, setPhone, agreed, setAgreed,
    confirmError, canSubmit, submitError, isLoading, handleSubmit,
  } = useRegisterForm();

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <RegisterFormFields
        email={email} onEmailChange={setEmail}
        password={password} onPasswordChange={setPassword}
        showPassword={showPw} onTogglePassword={() => setShowPw((v) => !v)}
        passwordConfirm={passwordConfirm} onPasswordConfirmChange={setPasswordConfirm}
        showPasswordConfirm={showPwc} onTogglePasswordConfirm={() => setShowPwc((v) => !v)}
        confirmError={confirmError}
        nickname={nickname} onNicknameChange={setNickname}
        nicknameCheckResult={nicknameCheck} onNicknameCheck={handleNicknameCheck} isNicknameChecking={isNicknameChecking}
        phone={phone} onPhoneChange={setPhone}
      />
      <RegisterSubmit agreed={agreed} onAgreeChange={setAgreed} submitError={submitError} canSubmit={canSubmit} isLoading={isLoading} />
    </form>
  );
}

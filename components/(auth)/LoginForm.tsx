'use client';

import { useLoginForm } from '@/hooks/auth/useLoginForm';
import LoginOptions from './LoginOptions';
import LoginFields from './LoginFields';

export default function LoginForm() {
  const { email, setEmail, password, setPassword, showPassword, setShowPassword, keepLogin, setKeepLogin, canSubmit, submitError, isLoading, handleSubmit } = useLoginForm();

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <LoginFields
        email={email} onEmailChange={setEmail}
        password={password} onPasswordChange={setPassword}
        showPassword={showPassword} onTogglePassword={() => setShowPassword((v) => !v)}
      />
      <LoginOptions keepLogin={keepLogin} onKeepLoginChange={setKeepLogin} />
      {submitError && <p className="text-xs text-red">{submitError}</p>}
      <button type="submit" disabled={!canSubmit || isLoading} className="h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        {isLoading ? '처리 중...' : '로그인'}
      </button>
    </form>
  );
}

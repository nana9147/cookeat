'use client';

import { useState } from 'react';
import LoginOptions from './LoginOptions';
import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`로그인 성공! 메인페이지로 이동합니다.`);
  };

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력해주세요"
          className="h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호</label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          placeholder="비밀번호를 입력해주세요"
        />
      </div>
      <LoginOptions keepLogin={keepLogin} onKeepLoginChange={setKeepLogin} />
      <button
        type="submit"
        className="h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
        onClick={handleSubmit}
      >
        로그인
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      setAuth(result.accessToken, result.refreshToken, result.user);
      router.replace('/admin');
    } catch (err) {
      const msg = err instanceof Error ? err.message : null;
      setError(msg?.includes('Invalid login') ? '이메일 또는 비밀번호가 올바르지 않습니다.' : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-text flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-dark-text">Cookeat 관리자</h1>
          <p className="text-sm text-gray-text mt-1">관리자 계정으로 로그인하세요</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-dark-text">이메일</label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-dark-text">비밀번호</label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-xs text-red">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

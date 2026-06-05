'use client';

import Link from 'next/link';

interface Props {
  activeTab: 'login' | 'register';
}

export default function AuthTabs({ activeTab }: Props) {
  return (
    <div className="flex rounded-lg bg-zinc-100 p-1">
      <Link
        href="/login"
        className={`flex-1 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
          activeTab === 'login'
            ? 'bg-white text-dark-text shadow-sm'
            : 'text-gray-text hover:text-dark-text'
        }`}
      >
        로그인
      </Link>
      <Link
        href="/register"
        className={`flex-1 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
          activeTab === 'register'
            ? 'bg-white text-dark-text shadow-sm'
            : 'text-gray-text hover:text-dark-text'
        }`}
      >
        회원가입
      </Link>
    </div>
  );
}

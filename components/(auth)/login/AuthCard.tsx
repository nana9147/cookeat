'use client';

import Image from 'next/image';
import Link from 'next/link';
import AuthTabs from './AuthTabs';
import SocialLogin from './SocialLogin';

// 로그인/회원가입 공통 카드 레이아웃
interface Props {
  activeTab: 'login' | 'register';
  children: React.ReactNode;
}

export default function AuthCard({ activeTab, children }: Props) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#F5F0E8] px-4 py-12">
      {/* 로고 및 서비스 소개 */}
      <div className="text-center mb-4">
        <Link href="/">
          <Image
            src="/assets/cookeat.png"
            alt="Cookeat"
            width={300}
            height={280}
            className="mx-auto w-25 h-auto"
            loading="eager"
          />
          <h1 className="text-h1 font-bold text-primary">Cookeat</h1>
        </Link>
        <p className="text-m text-gray-text mt-1">다양한 레시피를 쿠킷에서 찾아보세요</p>
      </div>
      {/* 카드 본체: 탭 + 폼 + 소셜 로그인 */}
      <div className="w-full max-w-135 bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-dark-text text-center">환영합니다!</h2>
          <p className="text-sm text-gray-text mt-1 text-center">
            로그인 또는 회원가입을 진행해주세요
          </p>
        </div>
        <AuthTabs activeTab={activeTab} />
        {children}
        <SocialLogin />
      </div>
    </div>
  );
}

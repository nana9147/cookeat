'use client';

import { KakaoIcon, GoogleIcon } from '@/components/(auth)/SocialIcons';

export default function SocialLogin() {
  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    alert(`${provider} 로그인은 아직 구현되지 않았습니다.`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <div className="flex-1 h-px bg-border" />
        <span>또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <button
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-zinc-50 transition-colors"
        onClick={() => handleSocialLogin('google')}
      >
        <GoogleIcon />
        Google로 계속하기
      </button>
      <button
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-sm font-medium hover:brightness-95 transition-all"
        onClick={() => handleSocialLogin('kakao')}
      >
        <KakaoIcon />
        Kakao로 계속하기
      </button>
    </div>
  );
}

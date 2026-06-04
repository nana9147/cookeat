'use client';

import { supabase } from '@/lib/supabase';
import { GoogleIcon, KakaoIcon } from './SocialIcons';

async function signInWith(provider: 'google' | 'kakao') {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export default function SocialLogin() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <div className="flex-1 h-px bg-border" />
        <span>또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-zinc-50 transition-colors" onClick={() => signInWith('google')}>
        <GoogleIcon />
        Google로 계속하기
      </button>
      <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-sm font-medium hover:brightness-95 transition-all" onClick={() => signInWith('kakao')}>
        <KakaoIcon />
        Kakao로 계속하기
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useRegisterFields } from './useRegisterFields';

// 회원가입 제출 로직 훅 (필드 상태는 useRegisterFields에서 관리)
export function useRegisterForm() {
  const fields = useRegisterFields();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!fields.canSubmit || isLoading) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      // Supabase 회원가입 API 호출 (닉네임은 user metadata로 전달)
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
        { email: fields.email, password: fields.password, data: { nickname: fields.nickname } },
        { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' } },
      );
      // 발급받은 토큰을 로컬스토리지에 저장
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      alert('회원가입 성공하였습니다. 메인페이지로 이동합니다.');
      router.push('/');
    } catch (err) {
      // 이미 가입된 이메일이면 별도 안내, 그 외 일반 오류 메시지
      const msg = axios.isAxiosError(err) ? (err.response?.data?.msg ?? err.response?.data?.message) : null;
      setSubmitError(msg?.includes('already registered') ? '이미 가입된 이메일입니다.' : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return { ...fields, submitError, isLoading, handleSubmit };
}

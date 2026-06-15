'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth/authService'
import { useAuthStore } from '@/store/authStore'

export function useLoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLogin, setKeepLogin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = email.trim().length > 0 && password.length > 0

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit || isLoading) return
    setIsLoading(true)
    setSubmitError(null)
    try {
      const result = await authService.login(email, password)
      setAuth(result.accessToken, result.refreshToken, result.user, keepLogin)
      router.push('/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : null
      // Supabase 오류 메시지 기준으로 한글 안내
      setSubmitError(msg?.includes('Invalid login') ? '이메일 또는 비밀번호가 올바르지 않습니다.' : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return { email, setEmail, password, setPassword, showPassword, setShowPassword, keepLogin, setKeepLogin, canSubmit, submitError, isLoading, handleSubmit }
}

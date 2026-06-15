'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRegisterFields } from './useRegisterFields'
import { authService } from '@/services/auth/authService'

export function useRegisterForm() {
  const fields = useRegisterFields()
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fields.canSubmit || isLoading) return
    setIsLoading(true)
    setSubmitError(null)
    try {
      await authService.register(fields.email, fields.password, fields.nickname, fields.phone)
      router.push('/register/complete')
    } catch (err) {
      const msg = err instanceof Error ? err.message : null
      setSubmitError(msg?.includes('already registered') ? '이미 가입된 이메일입니다.' : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return { ...fields, submitError, isLoading, handleSubmit }
}

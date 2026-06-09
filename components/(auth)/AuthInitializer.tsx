'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toAuthUser } from '@/services/auth/authTypes'

// 앱 시작 시 Supabase 세션 복원 및 토큰 자동 갱신을 담당하는 초기화 컴포넌트
export default function AuthInitializer() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const hydrated = useAuthStore((s) => s._hydrated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  // Supabase가 토큰을 자동 갱신하면 스토어도 업데이트
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        setAuth(session.access_token, session.refresh_token, toAuthUser(session.user))
      }
      if (event === 'SIGNED_OUT') clearAuth()
    })
    return () => subscription.unsubscribe()
  }, [])

  // Zustand hydration 완료 후 저장된 토큰을 Supabase 클라이언트에 주입
  useEffect(() => {
    if (!hydrated || !accessToken || !refreshToken) return
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => { if (error) clearAuth() })
  }, [hydrated])

  return null
}

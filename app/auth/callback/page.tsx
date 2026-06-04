'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Session } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    let settled = false
    let sub: { unsubscribe: () => void } | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    function handle(session: Session | null) {
      if (settled) return
      settled = true
      sub?.unsubscribe()
      if (timer) clearTimeout(timer)
      if (!session) { router.replace('/'); return }
      const u = session.user
      setAuth(session.access_token, session.refresh_token, {
        userId: u.id,
        nickname: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split('@')[0] ?? '',
        profileImage: u.user_metadata?.avatar_url ?? null,
      })
      router.replace(!u.user_metadata?.phone ? '/auth/profile' : '/')
    }

    console.log('[callback] search:', window.location.search)
    console.log('[callback] hash:', window.location.hash)

    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      console.log('[callback] PKCE code found')
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        console.log('[callback] exchangeCodeForSession:', { session: !!data?.session, error })
        handle(data?.session ?? null)
      })
      return
    }

    console.log('[callback] no code → implicit flow, listening...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[callback] authStateChange:', event, !!session)
      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) handle(session)
    })
    sub = subscription
    timer = setTimeout(() => handle(null), 5000)
    return () => { sub?.unsubscribe(); if (timer) clearTimeout(timer) }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-gray-text">로그인 처리 중...</p>
    </div>
  )
}

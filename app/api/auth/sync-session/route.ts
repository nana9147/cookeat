import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { COOKIE_OPTS } from '@/lib/cookieOptions'

// OAuth 콜백처럼 클라이언트에서 토큰을 받은 뒤 httpOnly 쿠키로 동기화할 때 사용
export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = await req.json()
  if (!accessToken) {
    return NextResponse.json({ error: 'accessToken required' }, { status: 400 })
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !user) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'user'

  const response = NextResponse.json({ ok: true })
  response.cookies.set('sb-access-token', accessToken, { ...COOKIE_OPTS, maxAge: 3600 })
  if (refreshToken) {
    response.cookies.set('sb-refresh-token', refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
  }
  response.cookies.set('sb-role', role, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

  return response
}

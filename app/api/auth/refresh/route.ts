import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { toAuthUser } from '@/services/auth/authTypes'
import { COOKIE_OPTS } from '@/lib/cookieOptions'

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json()
  if (!refreshToken) {
    return NextResponse.json({ error: 'refreshToken required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: 'refresh failed' }, { status: 401 })
  }

  const { access_token, refresh_token } = data.session

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_id', data.user.id)
    .maybeSingle()

  const role = (profile?.role ?? 'user') as 'user' | 'seller' | 'admin'

  const response = NextResponse.json({
    accessToken: access_token,
    refreshToken: refresh_token,
    user: toAuthUser(data.user, role),
  })

  response.cookies.set('sb-access-token', access_token, { ...COOKIE_OPTS, maxAge: 3600 })
  response.cookies.set('sb-refresh-token', refresh_token, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
  response.cookies.set('sb-role', role, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

  return response
}

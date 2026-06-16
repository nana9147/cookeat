import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_OPTS } from '@/lib/cookieOptions'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

interface JwtPayload {
  exp?: number
  app_metadata?: { role?: string }
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

function isExpired(payload: { exp?: number } | null): boolean {
  if (!payload?.exp) return true
  return Math.floor(Date.now() / 1000) >= payload.exp - 30
}

async function tryRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string; refresh_token?: string }
    if (!data.access_token || !data.refresh_token) return null
    return { accessToken: data.access_token, refreshToken: data.refresh_token }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  const isAdminPath = pathname.startsWith('/admin')
  const isSellerPath = pathname.startsWith('/seller')

  let token = accessToken
  let refreshed: { accessToken: string; refreshToken: string } | null = null

  if (token && isExpired(decodeJwtPayload(token))) {
    token = undefined
  }

  if (!token && refreshToken) {
    refreshed = await tryRefresh(refreshToken)
    if (refreshed) token = refreshed.accessToken
  }

  if (!token) {
    const loginUrl = new URL(isAdminPath ? '/admin/login' : '/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // JWT 서명으로 보호된 app_metadata에서 role 읽기. 토큰 갱신 전 첫 요청은 쿠키 fallback 사용
  const payload = decodeJwtPayload(token)
  const role = payload?.app_metadata?.role ?? request.cookies.get('sb-role')?.value

  if (isAdminPath && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (isSellerPath && role !== 'seller' && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()

  if (refreshed) {
    response.cookies.set('sb-access-token', refreshed.accessToken, { ...COOKIE_OPTS, maxAge: 3600 })
    response.cookies.set('sb-refresh-token', refreshed.refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*'],
}

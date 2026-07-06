import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabaseAdmin'

export type UserRole = 'user' | 'seller' | 'admin'

export interface AuthedUser {
  authId: string
  userId: number
  role: UserRole
}

export async function getAuthedUser(token: string): Promise<AuthedUser | null> {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('user_id, role')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!profile) return null

  return {
    authId: user.id,
    userId: profile.user_id,
    role: profile.role as UserRole,
  }
}

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ error: 'forbidden' }, { status: 403 })
}

/** 로그인 여부만 확인 */
export async function requireAuth(req: NextRequest): Promise<AuthedUser | NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return unauthorized()
  const user = await getAuthedUser(token)
  if (!user) return unauthorized()
  return user
}

/** 로그인 여부가 응답에 영향을 줄 뿐 필수는 아닌 공개 라우트용 — 실패해도 401 없이 null 반환 */
export async function getOptionalAuthedUser(req: NextRequest): Promise<AuthedUser | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return await getAuthedUser(token)
}

/** role: seller 또는 admin 만 허용 */
export async function requireSeller(req: NextRequest): Promise<AuthedUser | NextResponse> {
  const result = await requireAuth(req)
  if (result instanceof NextResponse) return result
  if (result.role !== 'seller' && result.role !== 'admin') return forbidden()
  return result
}

/** role: admin 만 허용 */
export async function requireAdmin(req: NextRequest): Promise<AuthedUser | NextResponse> {
  const result = await requireAuth(req)
  if (result instanceof NextResponse) return result
  if (result.role !== 'admin') return forbidden()
  return result
}

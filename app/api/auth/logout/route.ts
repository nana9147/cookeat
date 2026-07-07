import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const token =
    req.headers.get('authorization')?.replace('Bearer ', '') ??
    req.cookies.get('sb-access-token')?.value

  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token).catch(() => ({ data: { user: null } }))
    if (user) {
      await supabaseAdmin.auth.admin.signOut(user.id).catch(() => {})
    }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  response.cookies.delete('sb-role')
  return response
}

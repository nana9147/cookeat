import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('phone, point, nickname')
    .eq('email', user.email)
    .maybeSingle()

  return NextResponse.json({
    complete: !!profile?.phone,
    point: profile?.point ?? 0,
    email: user.email ?? '',
    nickname: profile?.nickname ?? '',
    phone: profile?.phone ?? '',
    isSocial: user.app_metadata?.provider !== 'email',
  })
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { nickname, phone, currentPassword, newPassword } = await req.json()

  if (nickname?.trim() || phone?.trim()) {
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ ...(nickname?.trim() && { nickname: nickname.trim() }), ...(phone?.trim() && { phone: phone.trim() }) })
      .eq('email', user.email)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (currentPassword && newPassword) {
    const isSocial = user.app_metadata?.provider !== 'email'
    if (isSocial) return NextResponse.json({ error: '소셜 로그인은 비밀번호 변경이 불가합니다.' }, { status: 400 })

    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email: user.email!, password: currentPassword })
    if (signInError) return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })

    const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword })
    if (pwError) return NextResponse.json({ error: pwError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

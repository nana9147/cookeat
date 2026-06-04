import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { nickname, phone } = await req.json()
  if (!nickname?.trim() || !phone?.trim())
    return NextResponse.json({ error: 'nickname and phone required' }, { status: 400 })

  await supabaseAdmin.from('users')
    .update({ nickname: nickname.trim(), phone: phone.trim() })
    .eq('email', user.email)

  return NextResponse.json({ ok: true })
}

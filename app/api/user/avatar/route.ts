import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('avatar') as File
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const path = `${user.id}/avatar`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)
  const urlWithBuster = `${publicUrl}?t=${Date.now()}`

  await Promise.all([
    supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { custom_avatar_url: urlWithBuster },
    }),
    supabaseAdmin
      .from('users')
      .update({ profile_image: urlWithBuster })
      .eq('auth_id', user.id),
  ])

  return NextResponse.json({ url: urlWithBuster })
}

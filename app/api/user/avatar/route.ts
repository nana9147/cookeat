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

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { custom_avatar_url: publicUrl },
  })

  return NextResponse.json({ url: publicUrl })
}

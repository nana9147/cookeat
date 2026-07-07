import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const nickname = req.nextUrl.searchParams.get('nickname')
  if (!nickname) return NextResponse.json({ error: 'nickname required' }, { status: 400 })

  const { data } = await supabaseAdmin
    .from('users')
    .select('nickname')
    .eq('nickname', nickname)
    .maybeSingle()

  return NextResponse.json({ exists: !!data })
}

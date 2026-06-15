import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_id', data.user.id)
    .maybeSingle();

  return NextResponse.json({
    user: { ...data.user, _role: profile?.role ?? 'user' },
    session: data.session,
  });
}

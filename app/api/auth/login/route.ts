import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { COOKIE_OPTS } from '@/lib/cookieOptions'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) return NextResponse.json({ error: error?.message ?? 'Login failed' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('auth_id', data.user.id)
    .maybeSingle();

  const role = profile?.role ?? 'user'

  // app_metadata에 role 저장 → 토큰 갱신 후부터는 JWT에서 직접 읽어 쿠키 위변조 방어
  await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role },
  })

  const response = NextResponse.json({
    user: { ...data.user, _role: role },
    session: data.session,
  });

  // middleware.ts가 읽을 httpOnly 쿠키 — JS에서 접근 불가
  response.cookies.set('sb-access-token', data.session.access_token, { ...COOKIE_OPTS, maxAge: 3600 })
  response.cookies.set('sb-refresh-token', data.session.refresh_token, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
  response.cookies.set('sb-role', role, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

  return response;
}

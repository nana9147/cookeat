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
    .select('role, user_id, status')
    .eq('auth_id', data.user.id)
    .maybeSingle();

  if (profile?.status === 'suspended') {
    await supabaseAdmin.auth.admin.signOut(data.user.id).catch(() => {});
    return NextResponse.json({ error: '정지된 계정입니다. 고객센터로 문의해주세요.' }, { status: 403 });
  }

  // users 테이블에 해당 계정 행이 없으면(수동 생성 계정 등) 기존 app_metadata.role 사용
  const VALID_ROLES = ['user', 'seller', 'admin'] as const;
  type Role = (typeof VALID_ROLES)[number];
  const existingRole = data.user.app_metadata?.role;
  const rawRole = profile?.role ?? (typeof existingRole === 'string' ? existingRole : undefined) ?? 'user';
  const role: Role = (VALID_ROLES as readonly string[]).includes(rawRole) ? (rawRole as Role) : 'user';

  // app_metadata에 role 저장 → 토큰 갱신 후부터는 JWT에서 직접 읽어 쿠키 위변조 방어
  await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { role },
  })

  const response = NextResponse.json({
    user: { ...data.user, _role: role, _dbUserId: profile?.user_id ?? 0 },
    session: data.session,
  });

  // middleware.ts가 읽을 httpOnly 쿠키 — JS에서 접근 불가
  response.cookies.set('sb-access-token', data.session.access_token, { ...COOKIE_OPTS, maxAge: 3600 })
  response.cookies.set('sb-refresh-token', data.session.refresh_token, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
  response.cookies.set('sb-role', role, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

  return response;
}

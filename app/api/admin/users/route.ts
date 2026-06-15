import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '50')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('users')
    .select('user_id, email, nickname, created_at, status, point, orders(count)', { count: 'exact' })
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(`nickname.ilike.%${keyword}%,email.ilike.%${keyword}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = (data ?? []).map((u) => {
    const orderCount = Array.isArray(u.orders) ? ((u.orders[0] as { count: number })?.count ?? 0) : 0;
    return {
      userId: u.user_id,
      email: u.email,
      nickname: u.nickname,
      createdAt: u.created_at,
      status: u.status as 'active' | 'suspended',
      point: u.point,
      orderCount,
      grade: orderCount >= 10 ? 'VIP' : '일반',
    };
  });

  return NextResponse.json({
    users,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

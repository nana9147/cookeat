import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('recipe_order_referrals')
    .select(
      `id, order_id, point_paid, created_at,
       recipes!inner(recipe_id, title, users!inner(nickname))`,
      { count: 'exact' }
    )
    .gt('point_paid', 0)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[GET /api/admin/recipes/referrals]', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type ReferralRow = {
    id: number;
    order_id: string;
    point_paid: number;
    created_at: string;
    recipes: { recipe_id: number; title: string; users: { nickname: string } | { nickname: string }[] | null } | null;
  };

  const referrals = ((data ?? []) as unknown as ReferralRow[]).map((r) => {
    const users = r.recipes?.users;
    const author = Array.isArray(users) ? (users[0]?.nickname ?? '') : (users?.nickname ?? '');
    return {
      id: r.id,
      orderId: r.order_id,
      recipeId: r.recipes?.recipe_id ?? null,
      recipeTitle: r.recipes?.title ?? '',
      author,
      pointPaid: r.point_paid,
      createdAt: r.created_at,
    };
  });

  return NextResponse.json({
    referrals,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

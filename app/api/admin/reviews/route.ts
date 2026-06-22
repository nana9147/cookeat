import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('reviews')
    .select(
      `review_id, rating, content, created_at,
       users!inner(nickname, email),
       products(name),
       recipes(title)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.ilike('content', `%${keyword}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawUser = { nickname: string; email: string };
  type RawProduct = { name: string } | null;
  type RawRecipe = { title: string } | null;

  const reviews = (data ?? []).map((r) => {
    const user = r.users as unknown as RawUser | null;
    const product = r.products as unknown as RawProduct;
    const recipe = r.recipes as unknown as RawRecipe;
    return {
      reviewId: r.review_id,
      author: user?.nickname ?? '(알 수 없음)',
      authorEmail: user?.email ?? '',
      targetName: product?.name ?? recipe?.title ?? '(알 수 없음)',
      targetType: product ? ('product' as const) : ('recipe' as const),
      rating: r.rating as number,
      content: r.content as string,
      createdAt: r.created_at,
    };
  });

  return NextResponse.json({
    reviews,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

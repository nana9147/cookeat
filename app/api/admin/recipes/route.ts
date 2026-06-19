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
    .from('recipes')
    .select(
      `recipe_id, title, difficulty, cooking_time, like_count, scrap_count, created_at,
       users!inner(nickname, email),
       recipe_categories(name)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.ilike('title', `%${keyword}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/recipes]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawUser = { nickname: string; email: string };
  type RawCategory = { name: string };

  const recipes = (data ?? []).map((r) => {
    const user = r.users as unknown as RawUser | null;
    const category = r.recipe_categories as unknown as RawCategory | null;
    return {
      recipeId: r.recipe_id,
      title: r.title,
      author: user?.nickname ?? '(알 수 없음)',
      authorEmail: user?.email ?? '',
      category: category?.name ?? '',
      difficulty: r.difficulty as '쉬움' | '보통' | '어려움',
      cookingTime: r.cooking_time,
      likeCount: r.like_count,
      scrapCount: r.scrap_count,
      createdAt: r.created_at,
    };
  });

  return NextResponse.json({
    recipes,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

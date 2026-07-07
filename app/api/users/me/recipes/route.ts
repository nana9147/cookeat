import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = 12;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('recipes')
    .select(
      `recipe_id, title, thumbnail, difficulty, cooking_time, servings,
       like_count, scrap_count, created_at,
       recipe_categories(name)`,
      { count: 'exact' }
    )
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = {
    recipe_id: number; title: string; thumbnail: string;
    difficulty: string; cooking_time: number; servings: number;
    like_count: number | null; scrap_count: number | null; created_at: string;
    recipe_categories: { name: string } | { name: string }[] | null;
  };

  const recipes = ((data as unknown as Row[]) ?? []).map((r) => {
    const cat = Array.isArray(r.recipe_categories) ? r.recipe_categories[0] : r.recipe_categories;
    return {
      recipeId: r.recipe_id, title: r.title, thumbnail: r.thumbnail,
      recipeCategoryName: cat?.name ?? '', difficulty: r.difficulty,
      cookingTime: r.cooking_time, servings: r.servings,
      likeCount: r.like_count ?? 0, scrapCount: r.scrap_count ?? 0, createdAt: r.created_at,
    };
  });

  return NextResponse.json({
    recipes,
    pagination: { page, limit, total: count ?? 0, hasNext: offset + limit < (count ?? 0) },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const [earnedData, usedData, recipeCountData] = await Promise.all([
    supabaseAdmin.from('point_history').select('amount', { count: 'exact' }).eq('type', '적립'),
    supabaseAdmin.from('point_history').select('amount', { count: 'exact' }).eq('type', '사용'),
    supabaseAdmin.from('recipes').select('recipe_id', { count: 'exact', head: true }),
  ]);

  if (earnedData.error || usedData.error || recipeCountData.error) {
    const err = earnedData.error ?? usedData.error ?? recipeCountData.error;
    console.error('[GET /api/admin/recipes/points]', err);
    return NextResponse.json({ error: err!.message }, { status: 500 });
  }

  const totalEarned = (earnedData.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalUsed = (usedData.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);

  return NextResponse.json({
    totalEarned,
    totalUsed,
    netOutstanding: totalEarned - totalUsed,
    totalRecipes: recipeCountData.count ?? 0,
  });
}

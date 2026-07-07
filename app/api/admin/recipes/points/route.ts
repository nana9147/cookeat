import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const [earnedData, usedData, recipeCountData, referralCountData, referralPointData] =
    await Promise.all([
      supabaseAdmin.from('point_history').select('amount').eq('type', '적립'),
      supabaseAdmin.from('point_history').select('amount').eq('type', '사용'),
      supabaseAdmin.from('recipes').select('recipe_id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('recipe_order_referrals')
        .select('*', { count: 'exact', head: true })
        .gt('point_paid', 0),
      supabaseAdmin.from('recipe_order_referrals').select('point_paid').gt('point_paid', 0),
    ]);

  const firstError = [
    earnedData.error,
    usedData.error,
    recipeCountData.error,
    referralCountData.error,
    referralPointData.error,
  ].find(Boolean);

  if (firstError) {
    console.error('[GET /api/admin/recipes/points]', JSON.stringify(firstError));
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const totalEarned = (earnedData.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalUsed = (usedData.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalReferralPoints = (referralPointData.data ?? []).reduce(
    (s, r) => s + (r.point_paid ?? 0),
    0
  );

  return NextResponse.json({
    totalEarned,
    totalUsed,
    netOutstanding: totalEarned - totalUsed,
    totalRecipes: recipeCountData.count ?? 0,
    referralOrderCount: referralCountData.count ?? 0,
    totalReferralPoints,
  });
}

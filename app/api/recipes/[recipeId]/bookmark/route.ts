import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ recipeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId } = await params;
  const id = Number(recipeId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const [bookmarkRes, countRes] = await Promise.all([
    supabaseAdmin.from('bookmarks').select('bookmark_id').eq('recipe_id', id).eq('user_id', authed.userId).maybeSingle(),
    supabaseAdmin.from('bookmarks').select('bookmark_id', { count: 'exact', head: true }).eq('recipe_id', id),
  ]);

  return NextResponse.json({ isActive: !!bookmarkRes.data, count: countRes.count ?? 0 });
}

export async function POST(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId } = await params;
  const id = Number(recipeId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('bookmarks').select('bookmark_id').eq('recipe_id', id).eq('user_id', authed.userId).maybeSingle();

  if (existing) {
    await supabaseAdmin.from('bookmarks').delete().eq('bookmark_id', existing.bookmark_id);
  } else {
    await supabaseAdmin.from('bookmarks').insert({ recipe_id: id, user_id: authed.userId });
  }

  const { count } = await supabaseAdmin
    .from('bookmarks').select('bookmark_id', { count: 'exact', head: true }).eq('recipe_id', id);

  await supabaseAdmin.from('recipes').update({ scrap_count: count ?? 0 }).eq('recipe_id', id);

  return NextResponse.json({ isActive: !existing, count: count ?? 0 });
}

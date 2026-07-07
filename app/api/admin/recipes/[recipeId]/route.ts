import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId: raw } = await params;
  const recipeId = parseInt(raw);
  if (isNaN(recipeId)) {
    return NextResponse.json({ error: 'invalid recipeId' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('recipes').delete().eq('recipe_id', recipeId);
  if (error) {
    console.error('[DELETE /api/admin/recipes/:recipeId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

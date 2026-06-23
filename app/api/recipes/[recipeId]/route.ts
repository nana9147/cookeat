import { NextRequest, NextResponse } from 'next/server';
import { fetchRecipeDetail } from '@/lib/serverRecipes';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const id = Number(recipeId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ success: false, error: 'Invalid recipeId' }, { status: 400 });
  }

  try {
    const data = await fetchRecipeDetail(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

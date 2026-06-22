import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('recipe_categories')
    .select('recipe_category_id, name, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: (data ?? []).map((category) => ({
      recipeCategoryId: category.recipe_category_id,
      name: category.name,
      sortOrder: category.sort_order ?? 0,
    })),
  });
}

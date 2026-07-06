import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('ingredients')
    .select('ingredient_id, category')
    .order('category', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: (data ?? []).map((row) => ({
      ingredientId: row.ingredient_id,
      name: row.category,
    })),
  });
}

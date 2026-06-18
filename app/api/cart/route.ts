import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  const ids = idsParam
    ? idsParam
        .split(',')
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];

  if (ids.length === 0) return NextResponse.json({ items: [] });
  if (ids.length > 50) {
    return NextResponse.json({ error: '한 번에 조회할 수 있는 상품은 50개까지입니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('product_id, name, price, image, stock, origin, status, sellers(store_name)')
    .in('product_id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['판매중', '품절', '숨김'] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const status = searchParams.get('status') ?? '';
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '50')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // keyword로 일치하는 seller_id 먼저 조회
  let matchingSellerIds: number[] = [];
  if (keyword) {
    const { data: sellers } = await supabaseAdmin
      .from('sellers')
      .select('seller_id')
      .ilike('store_name', `%${keyword}%`);
    matchingSellerIds = (sellers ?? []).map((s) => s.seller_id as number);
  }

  // category로 일치하는 ingredient_id 먼저 조회
  let matchingIngredientIds: number[] = [];
  if (category) {
    const { data: ingredients } = await supabaseAdmin
      .from('ingredients')
      .select('ingredient_id')
      .eq('category', category);
    matchingIngredientIds = (ingredients ?? []).map((i) => i.ingredient_id as number);

    if (matchingIngredientIds.length === 0) {
      return NextResponse.json({
        products: [],
        pagination: { page, limit, total: 0, hasNext: false },
      });
    }
  }

  let query = supabaseAdmin
    .from('products')
    .select(
      `product_id, name, brand, price, stock, status, sales_count, image, created_at,
       sellers!inner(seller_id, store_name),
       ingredients(name, category)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    if (matchingSellerIds.length > 0) {
      query = query.or(`name.ilike.%${keyword}%,seller_id.in.(${matchingSellerIds.join(',')})`);
    } else {
      query = query.ilike('name', `%${keyword}%`);
    }
  }

  if (status && VALID_STATUSES.includes(status as ProductStatus)) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.in('ingredient_id', matchingIngredientIds);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /admin/products] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((p) => {
    const seller = (p.sellers as unknown) as { seller_id: number; store_name: string } | null;
    const ingredient = (p.ingredients as unknown) as { name: string; category: string } | null;
    return {
      productId: p.product_id,
      name: p.name,
      brand: p.brand ?? null,
      price: p.price,
      stock: p.stock,
      status: p.status as ProductStatus,
      salesCount: p.sales_count,
      image: p.image,
      createdAt: p.created_at,
      sellerId: seller?.seller_id ?? null,
      sellerName: seller?.store_name ?? '',
      ingredientName: ingredient?.name ?? null,
      category: ingredient?.category ?? null,
    };
  });

  return NextResponse.json({
    products,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

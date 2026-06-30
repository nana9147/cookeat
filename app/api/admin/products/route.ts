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
  const parentId = parseInt(searchParams.get('parentId') ?? '');
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

  // parentId로 일치하는 category_id 먼저 조회
  let matchingCategoryIds: number[] = [];
  if (!isNaN(parentId)) {
    const { data: cats } = await supabaseAdmin
      .from('categories')
      .select('category_id')
      .eq('parent_id', parentId);
    matchingCategoryIds = (cats ?? []).map((c) => c.category_id as number);

    if (matchingCategoryIds.length === 0) {
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
       categories(category_id, name, parent_id)`,
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

  if (!isNaN(parentId) && matchingCategoryIds.length > 0) {
    query = query.in('category_id', matchingCategoryIds);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /admin/products] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawSeller = { seller_id: number; store_name: string };
  type RawCategory = { category_id: number; name: string; parent_id: number };

  const products = (data ?? []).map((p) => {
    const seller = p.sellers as unknown as RawSeller | null;
    const category = p.categories as unknown as RawCategory | null;
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
      categoryId: category?.category_id ?? null,
      categoryName: category?.name ?? null,
      parentId: category?.parent_id ?? null,
    };
  });

  return NextResponse.json({
    products,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

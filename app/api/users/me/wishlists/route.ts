import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = 12;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('product_wishlists')
    .select(
      `wishlist_id, created_at,
       products(product_id, name, image, price, discount_type, discount_value,
         sellers(store_name))`,
      { count: 'exact' }
    )
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ProductRow = {
    product_id: number; name: string; image: string;
    price: number; discount_type: string | null; discount_value: number | null;
    sellers: { store_name: string } | null;
  };
  type Row = { wishlist_id: number; created_at: string; products: ProductRow | null };

  const products = ((data as unknown as Row[]) ?? []).flatMap((row) => {
    const p = row.products;
    if (!p) return [];
    const discountedPrice =
      p.discount_type === 'percent' && p.discount_value
        ? Math.round(p.price * (1 - p.discount_value / 100))
        : p.discount_type === 'amount' && p.discount_value
          ? p.price - p.discount_value
          : p.price;
    return [{
      wishlistId: row.wishlist_id,
      productId: p.product_id,
      name: p.name,
      image: p.image,
      price: p.price,
      discountedPrice,
      seller: p.sellers?.store_name ?? '',
    }];
  });

  return NextResponse.json({
    products,
    pagination: { page, limit, total: count ?? 0, hasNext: offset + limit < (count ?? 0) },
  });
}

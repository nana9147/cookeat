import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcRating } from '@/lib/utils';
import type { ProductDetail } from '@/types/ingredient';

// Supabase는 JOIN 결과 타입을 정확히 추론하지 못하므로 로컬 타입으로 명시
type SellerRow = { seller_id: number; store_name: string; cs_phone: string };
type IngredientRow = { ingredient_id: number; category: string };

export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(
      `product_id, name, brand, price, stock, image, description, origin,
       sellers!inner ( seller_id, store_name, cs_phone ),
       ingredients ( ingredient_id, category )`
    )
    .eq('product_id', id)
    .eq('status', '판매중')
    .maybeSingle();

  if (error || !product) return null;

  const [imageResult, reviewResult] = await Promise.all([
    supabaseAdmin
      .from('product_images')
      .select('url')
      .eq('product_id', id)
      .order('sort_order', { ascending: true }),
    supabaseAdmin.from('reviews').select('rating').eq('product_id', id),
  ]);

  const extraImages = (imageResult.data ?? []) as { url: string }[];
  const reviews = (reviewResult.data ?? []) as { rating: number }[];

  const reviewCount = reviews.length;
  const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
  const rating = calcRating(ratingSum, reviewCount);

  const seller = product.sellers as unknown as SellerRow | null;
  const ingredient = product.ingredients as unknown as IngredientRow | null;

  const images = [product.image, ...extraImages.map((img) => img.url)].filter(
    Boolean
  ) as string[];

  return {
    productId: product.product_id,
    name: product.name,
    brand: product.brand ?? '',
    price: product.price,
    image: product.image,
    images,
    description: product.description ?? '',
    origin: product.origin ?? '',
    stock: product.stock,
    ingredientId: ingredient?.ingredient_id ?? null,
    category: ingredient?.category ?? '',
    sellerId: seller?.seller_id ?? null,
    seller: seller?.store_name ?? '',
    sellerPhone: seller?.cs_phone ?? '',
    rating,
    reviewCount,
  };
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface ProductFilters {
  keyword?: string;
  status?: string;
  categoryId?: number;
  parentId?: number;
  page: number;
  limit: number;
}

export async function getSellerProducts(sellerId: number, filters: ProductFilters) {
  const { keyword, status, categoryId, parentId, page, limit } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('products')
    .select(
      'product_id, name, price, stock, status, sales_count, created_at, image, brand, category_id, categories(name, parent_id)',
      { count: 'exact' }
    )
    .eq('seller_id', sellerId)
    .range(from, to);

  if (keyword) query = query.ilike('name', `%${keyword}%`);
  if (status) query = query.eq('status', status);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (parentId) {
    const { data: childCategories, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('category_id')
      .eq('parent_id', parentId);
    if (categoryError) throw categoryError;

    const childIds = (childCategories ?? []).map((c) => c.category_id);
    query = query.in('category_id', childIds);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const products = data ?? [];
  if (products.length === 0) {
    return { products: [], total: count ?? 0 };
  }

  const productIds = products.map((p) => p.product_id);
  const { data: recipeLinks, error: recipeError } = await supabaseAdmin
    .from('recipe_ingredients')
    .select('product_id, recipe_id')
    .in('product_id', productIds);
  if (recipeError) throw recipeError;

  const recipeCountMap = new Map<number, Set<number>>();
  for (const link of recipeLinks ?? []) {
    if (link.product_id === null) continue;
    if (!recipeCountMap.has(link.product_id)) {
      recipeCountMap.set(link.product_id, new Set());
    }
    recipeCountMap.get(link.product_id)!.add(link.recipe_id);
  }

  const productsWithCount = products.map((p) => ({
    ...p,
    linkedRecipeCount: recipeCountMap.get(p.product_id)?.size ?? 0,
  }));

  return { products: productsWithCount, total: count ?? 0 };
}

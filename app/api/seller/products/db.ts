import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadProductImage } from '@/lib/productImage';
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

interface CreateProductInput {
  sellerId: number;
  name: string;
  brand: string;
  origin: string;
  categoryId: number;
  status: string;
  price: number;
  stock: number;
  description: string;
  shippingTemplateId: number | null;
  returnPolicyTemplateId: number | null;
}

export async function createSellerProduct(
  input: CreateProductInput,
  representativeImage: File,
  subImages: File[]
) {
  const { data: categoryRow, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('category_id')
    .eq('category_id', input.categoryId)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!categoryRow) {
    throw new Error('존재하지 않는 카테고리입니다.');
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id: input.sellerId,
      name: input.name,
      brand: input.brand || null,
      origin: input.origin,
      category_id: input.categoryId,
      status: input.status,
      price: input.price,
      stock: input.stock,
      description: input.description || null,
      shipping_template_id: input.shippingTemplateId,
      return_policy_template_id: input.returnPolicyTemplateId,
      image: 'pending',
    })
    .select('product_id')
    .single();

  if (insertError) throw insertError;

  const productId = inserted.product_id;

  try {
    const representativeUrl = await uploadProductImage(productId, representativeImage);

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ image: representativeUrl })
      .eq('product_id', productId);

    if (updateError) throw updateError;

    if (subImages.length > 0) {
      const subImageUrls = await Promise.all(
        subImages.map((file) => uploadProductImage(productId, file))
      );

      const rows = subImageUrls.map((url, index) => ({
        product_id: productId,
        url,
        sort_order: index + 1,
      }));

      const { error: imagesError } = await supabaseAdmin.from('product_images').insert(rows);
      if (imagesError) throw imagesError;
    }

    return { productId };
  } catch (err) {
    await supabaseAdmin.from('products').delete().eq('product_id', productId);
    throw err;
  }
}

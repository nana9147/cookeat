import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadProductImage, deleteProductImageFile } from '@/lib/productImage';
import type { CreateProductInput, ProductFilters } from '@/types/seller/product';
import { resolveProductStatus } from '@/lib/products';
import { deleteSellerProduct } from './[productId]/db';

export async function getSellerProducts(sellerId: number, filters: ProductFilters) {
  const {
    keyword,
    status,
    categoryId,
    parentId,
    page,
    limit,
    sortBy,
    sortOrder = 'desc',
  } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('products')
    .select(
      'product_id, name, price, stock, status, sales_count, created_at, image, brand, category_id, categories(name, parent_id)',
      { count: 'exact' }
    )
    .eq('seller_id', sellerId);

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

  if (sortBy === 'price' || sortBy === 'stock') {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  query = query.range(from, to);

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
    productId: p.product_id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    status: p.status,
    image: p.image,
    brand: p.brand,
    categoryId: p.category_id,
    categories: p.categories,
    createdAt: p.created_at,
    linkedRecipeCount: recipeCountMap.get(p.product_id)?.size ?? 0,
  }));

  return { products: productsWithCount, total: count ?? 0 };
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
      status: resolveProductStatus(input.status, input.stock),
      price: input.price,
      stock: input.stock,
      description: input.description || null,
      shipping_template_id: input.shippingTemplateId,
      return_policy_template_id: input.returnPolicyTemplateId,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      image: 'pending',
    })
    .select('product_id')
    .single();

  if (insertError) throw insertError;

  const productId = inserted.product_id;

  const uploadedUrls: string[] = [];

  try {
    const representativeUrl = await uploadProductImage(productId, representativeImage);
    uploadedUrls.push(representativeUrl);

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ image: representativeUrl })
      .eq('product_id', productId);

    if (updateError) throw updateError;

    if (subImages.length > 0) {
      const subImageUrls = await Promise.all(
        subImages.map((file) => uploadProductImage(productId, file))
      );
      uploadedUrls.push(...subImageUrls);

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
    await Promise.allSettled(uploadedUrls.map((url) => deleteProductImageFile(url)));
    await supabaseAdmin.from('products').delete().eq('product_id', productId);
    throw err;
  }
}

export async function bulkUpdateProductStatus(
  sellerId: number,
  productIds: number[],
  status: string
) {
  const { data: ownedRows, error: ownedError } = await supabaseAdmin
    .from('products')
    .select('product_id')
    .eq('seller_id', sellerId)
    .in('product_id', productIds);

  if (ownedError) throw ownedError;

  const ownedIds = (ownedRows ?? []).map((r) => r.product_id);
  const failCount = productIds.length - ownedIds.length;

  if (ownedIds.length === 0) {
    return { successCount: 0, failCount: productIds.length };
  }

  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({ status, updated_at: new Date().toISOString() })
    .in('product_id', ownedIds);

  if (updateError) throw updateError;

  return { successCount: ownedIds.length, failCount };
}

export async function bulkDeleteSellerProducts(sellerId: number, productIds: number[]) {
  let successCount = 0;
  const failures: { productId: number; reason: string }[] = [];

  for (const productId of productIds) {
    try {
      await deleteSellerProduct(sellerId, productId);
      successCount += 1;
    } catch (e) {
      failures.push({
        productId,
        reason: e instanceof Error ? e.message : '삭제에 실패했습니다.',
      });
    }
  }

  return { successCount, failures };
}

export async function getSellerProductCounts(sellerId: number) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('status')
    .eq('seller_id', sellerId);

  if (error) throw error;

  const counts = { 전체: 0, 판매중: 0, 품절: 0, 판매종료: 0, 숨김: 0 };
  counts.전체 = (data ?? []).length;

  for (const row of data ?? []) {
    const status = row.status as keyof typeof counts;
    if (status in counts) counts[status] += 1;
  }

  return counts;
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadProductImage, deleteProductImageFile } from '@/lib/productImage';
import type { BulkImportRow, CreateProductInput, ProductFilters } from '@/types/seller/product';
import { resolveProductStatus } from '@/lib/products';
import { deleteSellerProduct } from './[productId]/db';
import { calcRating } from '@/lib/utils';

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

  const [{ data: recipeLinks, error: recipeError }, { data: reviewRows, error: reviewError }] =
    await Promise.all([
      supabaseAdmin
        .from('recipe_ingredients')
        .select('product_id, recipe_id')
        .in('product_id', productIds),
      supabaseAdmin.from('reviews').select('product_id, rating').in('product_id', productIds),
    ]);

  if (recipeError) throw recipeError;
  if (reviewError) throw reviewError;

  const recipeCountMap = new Map<number, Set<number>>();
  for (const link of recipeLinks ?? []) {
    if (link.product_id === null) continue;
    if (!recipeCountMap.has(link.product_id)) {
      recipeCountMap.set(link.product_id, new Set());
    }
    recipeCountMap.get(link.product_id)!.add(link.recipe_id);
  }
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviewRows ?? []) {
    if (!ratingMap.has(r.product_id)) ratingMap.set(r.product_id, { sum: 0, count: 0 });
    const stat = ratingMap.get(r.product_id)!;
    stat.sum += r.rating;
    stat.count += 1;
  }
  const productsWithCount = products.map((p) => {
    const ratingStat = ratingMap.get(p.product_id);
    return {
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
      rating: ratingStat ? calcRating(ratingStat.sum, ratingStat.count) : 0,
      reviewCount: ratingStat?.count ?? 0,
    };
  });

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

export async function getSellerLowStockProducts(sellerId: number) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('product_id, name, stock, min_stock')
    .eq('seller_id', sellerId)
    .eq('status', '판매중')
    .not('min_stock', 'is', null)
    .order('stock', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((p) => p.stock !== null && p.min_stock !== null && p.stock <= p.min_stock)
    .map((p) => ({
      productId: p.product_id,
      name: p.name,
      stock: p.stock,
      minStock: p.min_stock,
    }));
}

export async function getSellerProductsForExport(
  sellerId: number,
  options: {
    offset: number;
    limit: number;
    keyword?: string;
    status?: string;
    categoryId?: number;
    parentId?: number;
    productIds?: number[];
  }
) {
  const { offset, limit, keyword, status, categoryId, parentId, productIds } = options;

  let query = supabaseAdmin
    .from('products')
    .select(
      `product_id, name, brand, origin, price, stock, discount_type, discount_value, status,
       description, image, created_at,
       categories(name, parent_id),
       shipping_templates(name),
       return_policy_templates(name)`,
      { count: 'exact' }
    )
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (productIds && productIds.length > 0) {
    query = query.in('product_id', productIds);
  } else {
    if (keyword) query = query.ilike('name', `%${keyword}%`);
    if (status) query = query.eq('status', status);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (parentId) {
      const { data: childCategories } = await supabaseAdmin
        .from('categories')
        .select('category_id')
        .eq('parent_id', parentId);
      const childIds = (childCategories ?? []).map((c) => c.category_id);
      query = query.in('category_id', childIds);
    }
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const products = data ?? [];
  const fetchedProductIds = products.map((p) => p.product_id);

  const parentIds = [
    ...new Set(
      products
        .map((p) => (p.categories as unknown as { parent_id: number | null } | null)?.parent_id)
        .filter((id): id is number => id !== null)
    ),
  ];

  const [{ data: parentRows }, { data: recipeLinks }, { data: reviewRows }] = await Promise.all([
    parentIds.length > 0
      ? supabaseAdmin
          .from('ingredients')
          .select('ingredient_id, category')
          .in('ingredient_id', parentIds)
      : Promise.resolve({ data: [] }),
    fetchedProductIds.length > 0
      ? supabaseAdmin
          .from('recipe_ingredients')
          .select('product_id, recipe_id')
          .in('product_id', fetchedProductIds)
      : Promise.resolve({ data: [] }),
    fetchedProductIds.length > 0
      ? supabaseAdmin
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', fetchedProductIds)
      : Promise.resolve({ data: [] }),
  ]);

  const parentNameMap = new Map((parentRows ?? []).map((p) => [p.ingredient_id, p.category]));

  const recipeCountMap = new Map<number, Set<number>>();
  for (const link of recipeLinks ?? []) {
    if (link.product_id === null) continue;
    if (!recipeCountMap.has(link.product_id)) recipeCountMap.set(link.product_id, new Set());
    recipeCountMap.get(link.product_id)!.add(link.recipe_id);
  }

  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviewRows ?? []) {
    if (!ratingMap.has(r.product_id)) ratingMap.set(r.product_id, { sum: 0, count: 0 });
    const stat = ratingMap.get(r.product_id)!;
    stat.sum += r.rating;
    stat.count += 1;
  }

  const rows = products.map((p) => {
    const category = p.categories as unknown as { name: string; parent_id: number | null } | null;
    const shippingTemplate = p.shipping_templates as unknown as { name: string } | null;
    const returnPolicyTemplate = p.return_policy_templates as unknown as { name: string } | null;
    const ratingStat = ratingMap.get(p.product_id);

    return {
      productId: p.product_id,
      name: p.name,
      parentCategoryName: category?.parent_id ? (parentNameMap.get(category.parent_id) ?? '') : '',
      categoryName: category?.name ?? '',
      brand: p.brand ?? '',
      origin: p.origin ?? '',
      price: p.price,
      stock: p.stock,
      discountType: p.discount_type ?? 'none',
      discountValue: p.discount_value,
      status: p.status,
      shippingTemplateName: shippingTemplate?.name ?? '',
      returnPolicyTemplateName: returnPolicyTemplate?.name ?? '',
      linkedRecipeCount: recipeCountMap.get(p.product_id)?.size ?? 0,
      rating: ratingStat ? calcRating(ratingStat.sum, ratingStat.count) : 0,
      reviewCount: ratingStat?.count ?? 0,
      description: p.description ?? '',
      image: p.image,
      createdAt: p.created_at,
    };
  });

  return { rows, total: count ?? 0 };
}

export async function bulkImportSellerProducts(sellerId: number, rows: BulkImportRow[]) {
  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('category_id, name, parent_id, ingredients(category)');

  const { data: shippingTemplates } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id, name')
    .eq('seller_id', sellerId);

  const { data: returnPolicyTemplates } = await supabaseAdmin
    .from('return_policy_templates')
    .select('template_id, name')
    .eq('seller_id', sellerId);

  const categoryMap = new Map<string, number>();
  for (const c of allCategories ?? []) {
    const parentName = (c.ingredients as unknown as { category: string } | null)?.category ?? '';
    categoryMap.set(`${parentName}|${c.name}`, c.category_id);
  }

  const shippingMap = new Map((shippingTemplates ?? []).map((t) => [t.name, t.template_id]));
  const returnPolicyMap = new Map(
    (returnPolicyTemplates ?? []).map((t) => [t.name, t.template_id])
  );

  let successCount = 0;
  const failures: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.name || !row.price || !row.stock || !row.origin || !row.image) {
      failures.push({
        row: i + 1,
        reason: '필수 항목이 누락되었습니다. (상품명/가격/재고/원산지/대표이미지URL)',
      });
      continue;
    }

    const categoryId = categoryMap.get(`${row.parentCategoryName}|${row.categoryName}`);
    if (!categoryId) {
      failures.push({
        row: i + 1,
        reason: `카테고리를 찾을 수 없습니다. (${row.parentCategoryName} > ${row.categoryName})`,
      });
      continue;
    }

    const shippingTemplateId = shippingMap.get(row.shippingTemplateName);
    if (!shippingTemplateId) {
      failures.push({
        row: i + 1,
        reason: `배송템플릿 '${row.shippingTemplateName}'을 찾을 수 없습니다.`,
      });
      continue;
    }

    const returnPolicyTemplateId = returnPolicyMap.get(row.returnPolicyTemplateName);
    if (!returnPolicyTemplateId) {
      failures.push({
        row: i + 1,
        reason: `반품정책 '${row.returnPolicyTemplateName}'을 찾을 수 없습니다.`,
      });
      continue;
    }

    const { error } = await supabaseAdmin.from('products').insert({
      seller_id: sellerId,
      name: row.name,
      brand: row.brand || null,
      origin: row.origin,
      category_id: categoryId,
      status: resolveProductStatus(row.status || '판매중', row.stock),
      price: row.price,
      stock: row.stock,
      description: row.description || null,
      shipping_template_id: shippingTemplateId,
      return_policy_template_id: returnPolicyTemplateId,
      discount_type: row.discountType || 'none',
      discount_value: row.discountValue ?? null,
      image: row.image,
    });

    if (error) {
      failures.push({ row: i + 1, reason: error.message });
      continue;
    }

    successCount += 1;
  }

  return { successCount, failures };
}

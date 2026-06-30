import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadProductImage, deleteProductImageFile } from '@/lib/productImage';
import type { UpdateProductInput, SubImageInput } from '@/types/seller/product';

// ===== 상품 단건 조회 =====

export async function getSellerProductById(sellerId: number, productId: number) {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(
      `product_id, name, brand, origin, category_id, status, price, stock,
      description, shipping_template_id, return_policy_template_id, image, seller_id,
      discount_type, discount_value,
      categories(category_id, name, parent_id)`
    )
    .eq('product_id', productId)
    .maybeSingle();

  if (error) throw error;
  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.');
  }
  if (product.seller_id !== sellerId) {
    throw new Error('해당 상품에 접근할 권한이 없습니다.');
  }

  const { data: subImages, error: imagesError } = await supabaseAdmin
    .from('product_images')
    .select('image_id, url, sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (imagesError) throw imagesError;

  return { product, subImages: subImages ?? [] };
}

// ===== 상품 수정 =====

export async function updateSellerProduct(
  input: UpdateProductInput,
  representativeImage: File | null,
  subImages: SubImageInput[]
) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('product_id, seller_id, image')
    .eq('product_id', input.productId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error('상품을 찾을 수 없습니다.');
  if (existing.seller_id !== input.sellerId) {
    throw new Error('해당 상품을 수정할 권한이 없습니다.');
  }

  const { data: categoryRow, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('category_id')
    .eq('category_id', input.categoryId)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!categoryRow) throw new Error('존재하지 않는 카테고리입니다.');

  let newImageUrl: string | null = null;
  if (representativeImage) {
    newImageUrl = await uploadProductImage(input.productId, representativeImage);
  }

  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({
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
      discount_type: input.discountType,
      discount_value: input.discountValue,
      ...(newImageUrl ? { image: newImageUrl } : {}),
    })
    .eq('product_id', input.productId);

  if (updateError) {
    if (newImageUrl) await deleteProductImageFile(newImageUrl);
    throw updateError;
  }

  if (newImageUrl && existing.image && existing.image !== 'pending') {
    await deleteProductImageFile(existing.image);
  }

  const { data: currentSubImages, error: currentError } = await supabaseAdmin
    .from('product_images')
    .select('image_id, url')
    .eq('product_id', input.productId);

  if (currentError) throw currentError;

  const keepIds = new Set(subImages.filter((s) => s.imageId !== undefined).map((s) => s.imageId));

  const toDelete = (currentSubImages ?? []).filter((row) => !keepIds.has(row.image_id));
  if (toDelete.length > 0) {
    const { error: deleteRowsError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .in(
        'image_id',
        toDelete.map((r) => r.image_id)
      );
    if (deleteRowsError) throw deleteRowsError;
    await Promise.allSettled(toDelete.map((row) => deleteProductImageFile(row.url)));
  }

  for (let i = 0; i < subImages.length; i++) {
    const item = subImages[i];
    const sortOrder = i + 1;

    if (item.imageId !== undefined) {
      const { error: orderError } = await supabaseAdmin
        .from('product_images')
        .update({ sort_order: sortOrder })
        .eq('image_id', item.imageId);
      if (orderError) throw orderError;
    } else if (item.file) {
      const url = await uploadProductImage(input.productId, item.file);
      const { error: insertError } = await supabaseAdmin
        .from('product_images')
        .insert({ product_id: input.productId, url, sort_order: sortOrder });
      if (insertError) {
        await deleteProductImageFile(url);
        throw insertError;
      }
    }
  }

  return { productId: input.productId };
}

// ===== 상품 삭제 =====

export async function deleteSellerProduct(sellerId: number, productId: number) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('product_id, seller_id, image')
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error('상품을 찾을 수 없습니다.');
  if (existing.seller_id !== sellerId) {
    throw new Error('해당 상품을 삭제할 권한이 없습니다.');
  }

  const { data: activeOrders, error: activeOrdersError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('product_id', productId)
    .in('shipping_status', ['결제완료', '배송준비', '배송중'])
    .limit(1);

  if (activeOrdersError) throw activeOrdersError;
  if (activeOrders && activeOrders.length > 0) {
    throw new Error('주문건이 존재하여 삭제할 수 없습니다. 판매종료로 상태변경하세요.');
  }

  const { data: subImages, error: subImagesError } = await supabaseAdmin
    .from('product_images')
    .select('image_id, url')
    .eq('product_id', productId);

  if (subImagesError) throw subImagesError;

  for (const row of subImages ?? []) {
    await deleteProductImageFile(row.url);
  }

  if (existing.image && existing.image !== 'pending') {
    await deleteProductImageFile(existing.image);
  }

  const { error: deleteImagesError } = await supabaseAdmin
    .from('product_images')
    .delete()
    .eq('product_id', productId);
  if (deleteImagesError) throw deleteImagesError;

  const { error: deleteProductError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('product_id', productId);

  if (deleteProductError) throw deleteProductError;

  return { productId };
}

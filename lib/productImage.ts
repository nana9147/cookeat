import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const PRODUCT_IMAGE_BUCKET = 'product-images';

export async function uploadProductImage(productId: number, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${productId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImageFile(url: string) {
  const marker = `/${PRODUCT_IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);

  const { error } = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) {
    console.error('Storage 파일 삭제 실패:', path, error.message);
  }
}

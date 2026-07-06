import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const RECIPE_IMAGE_BUCKET = 'recipe-images';

export async function uploadRecipeImage(
  recipeId: number,
  file: File,
  prefix: string
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${recipeId}/${prefix}-${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(RECIPE_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(RECIPE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteRecipeImageFile(url: string) {
  const marker = `/${RECIPE_IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);

  const { error } = await supabaseAdmin.storage.from(RECIPE_IMAGE_BUCKET).remove([path]);
  if (error) {
    console.error('Storage 파일 삭제 실패:', path, error.message);
  }
}

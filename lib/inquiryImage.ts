import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const INQUIRY_IMAGE_BUCKET = 'inquiry_image';

export async function uploadInquiryImage(userId: number, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(INQUIRY_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(INQUIRY_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

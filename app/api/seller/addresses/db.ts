import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { CreateAddressInput } from '@/types/seller/shipping';

export async function getAddressesBySellerId(sellerId: number) {
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.address_id,
    name: row.name,
    zipCode: row.zip_code,
    baseAddress: row.base_address,
    detailAddress: row.detail_address,
    type: row.type,
    isDefault: row.is_default,
  }));
}

export async function createAddress(sellerId: number, input: CreateAddressInput) {
  const zipCode = input.zipCode.trim();
  const baseAddress = input.baseAddress.trim();
  const detailAddress = input.detailAddress.trim();

  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('addresses')
    .select('zip_code, base_address, detail_address')
    .eq('seller_id', sellerId)
    .eq('type', input.type);

  if (existingError) throw existingError;

  const isDuplicate = (existing ?? []).some(
    (a) =>
      normalize(a.zip_code) === normalize(zipCode) &&
      normalize(a.base_address) === normalize(baseAddress) &&
      normalize(a.detail_address) === normalize(detailAddress)
  );

  if (isDuplicate) {
    throw new Error('이미 등록된 주소입니다.');
  }

  const { count, error: countError } = await supabaseAdmin
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', sellerId)
    .eq('type', input.type);

  if (countError) throw countError;

  const isFirstOfType = count === 0;
  const shouldBeDefault = input.isDefault || isFirstOfType;

  if (shouldBeDefault) {
    const { error: resetError } = await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('seller_id', sellerId)
      .eq('type', input.type)
      .eq('is_default', true);

    if (resetError) throw resetError;
  }

  const { data, error } = await supabaseAdmin
    .from('addresses')
    .insert({
      seller_id: sellerId,
      type: input.type,
      name: input.name,
      zip_code: zipCode,
      base_address: baseAddress,
      detail_address: detailAddress,
      is_default: shouldBeDefault,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.address_id,
    name: data.name,
    zipCode: data.zip_code,
    baseAddress: data.base_address,
    detailAddress: data.detail_address,
    type: data.type,
    isDefault: data.is_default,
  };
}

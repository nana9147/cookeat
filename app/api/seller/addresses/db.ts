import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { CreateAddressInput, UpdateAddressResult } from '@/types/seller/shipping';

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

export async function deleteAddress(sellerId: number, addressId: number) {
  const { data: target, error: targetError } = await supabaseAdmin
    .from('addresses')
    .select('address_id, seller_id, type, is_default')
    .eq('address_id', addressId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) throw new Error('주소를 찾을 수 없습니다.');
  if (target.seller_id !== sellerId) throw new Error('해당 주소를 삭제할 권한이 없습니다.');

  const { error: deleteError } = await supabaseAdmin
    .from('addresses')
    .delete()
    .eq('address_id', addressId);

  if (deleteError) throw deleteError;

  let newDefaultAddressId: number | null = null;

  if (target.is_default) {
    const { data: remaining, error: remainingError } = await supabaseAdmin
      .from('addresses')
      .select('address_id')
      .eq('seller_id', sellerId)
      .eq('type', target.type)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (remainingError) throw remainingError;

    if (remaining) {
      const { error: promoteError } = await supabaseAdmin
        .from('addresses')
        .update({ is_default: true })
        .eq('address_id', remaining.address_id);

      if (promoteError) throw promoteError;

      newDefaultAddressId = remaining.address_id;
    }
  }

  return { addressId, newDefaultAddressId };
}

export async function updateAddress(
  sellerId: number,
  addressId: number,
  input: CreateAddressInput
): Promise<UpdateAddressResult> {
  const { data: target, error: targetError } = await supabaseAdmin
    .from('addresses')
    .select('address_id, seller_id, type, is_default')
    .eq('address_id', addressId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) throw new Error('주소를 찾을 수 없습니다.');
  if (target.seller_id !== sellerId) throw new Error('해당 주소를 수정할 권한이 없습니다.');

  const zipCode = input.zipCode.trim();
  const baseAddress = input.baseAddress.trim();
  const detailAddress = input.detailAddress.trim();
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

  // 1. 중복 검사 (자기 자신 제외)
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('addresses')
    .select('address_id, zip_code, base_address, detail_address')
    .eq('seller_id', sellerId)
    .eq('type', input.type)
    .neq('address_id', addressId);

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

  // 2. 기본 해제 시도 시, 승격할 다른 주소를 미리 찾아둠 (없으면 에러)
  const isUnsettingDefault = target.is_default && !input.isDefault;
  let promotedAddressId: number | null = null;

  if (isUnsettingDefault) {
    const { data: others, error: othersError } = await supabaseAdmin
      .from('addresses')
      .select('address_id')
      .eq('seller_id', sellerId)
      .eq('type', target.type)
      .neq('address_id', addressId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (othersError) throw othersError;

    if (!others) {
      throw new Error('최소 1개의 기본 주소가 필요합니다.');
    }

    promotedAddressId = others.address_id;
  }

  // 3. 새로 기본으로 설정하는 경우, 같은 type의 기존 기본 해제
  if (input.isDefault && !target.is_default) {
    const { error: resetError } = await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('seller_id', sellerId)
      .eq('type', input.type)
      .eq('is_default', true);

    if (resetError) throw resetError;
  }

  // 4. 실제 업데이트
  const { data, error } = await supabaseAdmin
    .from('addresses')
    .update({
      type: input.type,
      name: input.name,
      zip_code: zipCode,
      base_address: baseAddress,
      detail_address: detailAddress,
      is_default: input.isDefault,
    })
    .eq('address_id', addressId)
    .select()
    .single();

  if (error) throw error;

  // 5. 승격 대상이 있으면 실제로 승격 실행
  if (promotedAddressId) {
    const { error: promoteError } = await supabaseAdmin
      .from('addresses')
      .update({ is_default: true })
      .eq('address_id', promotedAddressId);

    if (promoteError) throw promoteError;
  }

  return {
    id: data.address_id,
    name: data.name,
    zipCode: data.zip_code,
    baseAddress: data.base_address,
    detailAddress: data.detail_address,
    type: data.type,
    isDefault: data.is_default,
    promotedAddressId,
  };
}

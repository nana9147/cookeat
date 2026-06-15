import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getSellerByUserId(userId: number) {
  const { data } = await supabaseAdmin
    .from('sellers')
    .select('seller_id, is_co_representative, representative_name, cs_phone, store_name, business_number, business_address, bank_name, bank_account, approve_status, rejected_reason, created_at')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? null
}

interface SellerFields {
  isCoRepresentative: boolean;
  representativeName: string;
  csPhone: string;
  storeName: string;
  businessNumber: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
}

export async function reapplySeller(sellerId: number, fields: SellerFields) {
  return supabaseAdmin
    .from('sellers')
    .update({
      is_co_representative: fields.isCoRepresentative,
      representative_name: fields.representativeName.trim(),
      cs_phone: fields.csPhone.trim(),
      store_name: fields.storeName.trim(),
      business_number: fields.businessNumber.trim(),
      business_address: fields.businessAddress.trim() || null,
      bank_name: fields.bankName.trim(),
      bank_account: fields.bankAccount.trim(),
      approve_status: 'pending',
      rejected_reason: null,
    })
    .eq('seller_id', sellerId)
}

export async function insertSeller(userId: number, fields: SellerFields) {
  return supabaseAdmin
    .from('sellers')
    .insert({
      user_id: userId,
      is_co_representative: fields.isCoRepresentative,
      representative_name: fields.representativeName.trim(),
      cs_phone: fields.csPhone.trim(),
      store_name: fields.storeName.trim(),
      business_number: fields.businessNumber.trim(),
      business_address: fields.businessAddress.trim() || null,
      bank_name: fields.bankName.trim(),
      bank_account: fields.bankAccount.trim(),
    })
    .select('seller_id')
    .single()
}

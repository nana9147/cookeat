import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getUserId(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('user_id')
    .eq('auth_id', user.id)
    .maybeSingle()

  return profile?.user_id ?? null
}

export async function getSellerByUserId(userId: number) {
  const { data } = await supabaseAdmin
    .from('sellers')
    .select('seller_id, store_name, business_number, business_address, bank_name, bank_account, approve_status, rejected_reason, created_at')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? null
}

interface SellerFields {
  storeName: string;
  businessNumber: string;
  businessAddress?: string;
  bankName: string;
  bankAccount: string;
}

export async function reapplySeller(sellerId: number, fields: SellerFields) {
  return supabaseAdmin
    .from('sellers')
    .update({
      store_name: fields.storeName.trim(),
      business_number: fields.businessNumber.trim(),
      business_address: fields.businessAddress?.trim() || null,
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
      store_name: fields.storeName.trim(),
      business_number: fields.businessNumber.trim(),
      business_address: fields.businessAddress?.trim() || null,
      bank_name: fields.bankName.trim(),
      bank_account: fields.bankAccount.trim(),
    })
    .select('seller_id')
    .single()
}

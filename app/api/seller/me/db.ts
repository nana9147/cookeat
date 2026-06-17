import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface UpdateSellerFields {
  storeName: string;
  representativeName: string;
  csPhone: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
}

export async function getSellerByUserId(userId: number) {
  const { data } = await supabaseAdmin
    .from('sellers')
    .select(
      'seller_id, user_id, is_co_representative, representative_name, cs_phone, store_name, business_number, business_address, bank_name, bank_account, commission_rate, approve_status, rejected_reason, created_at'
    )
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export async function updateSeller(userId: number, fields: UpdateSellerFields) {
  return supabaseAdmin
    .from('sellers')
    .update({
      store_name: fields.storeName.trim(),
      representative_name: fields.representativeName.trim(),
      cs_phone: fields.csPhone.trim(),
      business_address: fields.businessAddress.trim(),
      bank_name: fields.bankName.trim(),
      bank_account: fields.bankAccount.trim(),
    })
    .eq('user_id', userId);
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { CreateShippingTemplateInput } from '@/types/seller/shipping';

export async function createShippingTemplate(input: CreateShippingTemplateInput) {
  const { count, error: countError } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id', { count: 'exact', head: true })
    .eq('seller_id', input.sellerId);

  if (countError) throw countError;

  const shouldBeDefault = input.isDefault || (count ?? 0) === 0;

  if (shouldBeDefault) {
    const { error: unsetError } = await supabaseAdmin
      .from('shipping_templates')
      .update({ is_default: false })
      .eq('seller_id', input.sellerId)
      .eq('is_default', true);
    if (unsetError) throw unsetError;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('shipping_templates')
    .insert({
      seller_id: input.sellerId,
      name: input.name,
      fee_type: input.feeType,
      fee: input.fee,
      free_threshold: input.freeThreshold,
      return_fee: input.returnFee,
      origin_address: input.originAddress,
      return_address: input.returnAddress,
      is_default: shouldBeDefault,
    })
    .select('template_id')
    .single();

  if (insertError) throw insertError;

  return { templateId: inserted.template_id };
}

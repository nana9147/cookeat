import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { CreateReturnPolicyTemplateInput } from '@/types/seller/shipping';

export async function createReturnPolicyTemplate(input: CreateReturnPolicyTemplateInput) {
  const { count, error: countError } = await supabaseAdmin
    .from('return_policy_templates')
    .select('template_id', { count: 'exact', head: true })
    .eq('seller_id', input.sellerId);

  if (countError) throw countError;

  const shouldBeDefault = input.isDefault || (count ?? 0) === 0;

  if (shouldBeDefault) {
    const { error: unsetError } = await supabaseAdmin
      .from('return_policy_templates')
      .update({ is_default: false })
      .eq('seller_id', input.sellerId)
      .eq('is_default', true);
    if (unsetError) throw unsetError;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('return_policy_templates')
    .insert({
      seller_id: input.sellerId,
      name: input.name,
      return_period: input.returnPeriod,
      refund_period: input.refundPeriod,
      non_return_reasons: input.nonReturnReasons,
      is_default: shouldBeDefault,
    })
    .select('template_id')
    .single();

  if (insertError) throw insertError;

  return { templateId: inserted.template_id };
}

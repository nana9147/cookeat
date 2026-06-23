import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type {
  UpdateShippingTemplateInput,
  SetDefaultShippingTemplateInput,
} from '@/types/seller/shipping';

// ===== 배송 템플릿 일반 수정 (이름, 요금 등) =====

export async function updateShippingTemplate(input: UpdateShippingTemplateInput) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id, seller_id')
    .eq('template_id', input.templateId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error('템플릿을 찾을 수 없습니다.');
  if (existing.seller_id !== input.sellerId) {
    throw new Error('해당 템플릿을 수정할 권한이 없습니다.');
  }

  const { error: updateError } = await supabaseAdmin
    .from('shipping_templates')
    .update({
      name: input.name,
      fee_type: input.feeType,
      fee: input.fee,
      free_threshold: input.freeThreshold,
      return_fee: input.returnFee,
      origin_address: input.originAddress,
      return_address: input.returnAddress,
    })
    .eq('template_id', input.templateId);

  if (updateError) throw updateError;

  return { templateId: input.templateId };
}

// ===== 기본 템플릿 설정 (전용) =====

export async function setDefaultShippingTemplate(input: SetDefaultShippingTemplateInput) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id, seller_id, is_default')
    .eq('template_id', input.templateId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error('템플릿을 찾을 수 없습니다.');
  if (existing.seller_id !== input.sellerId) {
    throw new Error('해당 템플릿을 수정할 권한이 없습니다.');
  }

  if (existing.is_default) {
    return { templateId: input.templateId };
  }

  const { error: unsetError } = await supabaseAdmin
    .from('shipping_templates')
    .update({ is_default: false })
    .eq('seller_id', input.sellerId)
    .eq('is_default', true);
  if (unsetError) throw unsetError;

  const { error: setError } = await supabaseAdmin
    .from('shipping_templates')
    .update({ is_default: true })
    .eq('template_id', input.templateId);
  if (setError) throw setError;

  return { templateId: input.templateId };
}

// ===== 배송 템플릿 삭제 =====

export async function deleteShippingTemplate(sellerId: number, templateId: number) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id, seller_id, is_default')
    .eq('template_id', templateId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) throw new Error('템플릿을 찾을 수 없습니다.');
  if (existing.seller_id !== sellerId) {
    throw new Error('해당 템플릿을 삭제할 권한이 없습니다.');
  }

  const { error: deleteError } = await supabaseAdmin
    .from('shipping_templates')
    .delete()
    .eq('template_id', templateId);

  if (deleteError) throw deleteError;

  if (!existing.is_default) {
    return { templateId, newDefaultTemplateId: null };
  }

  const { data: candidate, error: candidateError } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (candidateError) throw candidateError;

  if (!candidate) {
    return { templateId, newDefaultTemplateId: null };
  }

  const { error: promoteError } = await supabaseAdmin
    .from('shipping_templates')
    .update({ is_default: true })
    .eq('template_id', candidate.template_id);

  if (promoteError) throw promoteError;

  return { templateId, newDefaultTemplateId: candidate.template_id };
}

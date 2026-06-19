import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { data, error } = await supabaseAdmin
    .from('return_policy_templates')
    .select(
      'template_id, name, return_period, refund_period, non_return_reasons, is_default, created_at'
    )
    .eq('seller_id', sellerCtx.sellerId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const templates = (data ?? []).map((t) => ({
    templateId: t.template_id,
    name: t.name,
    returnPeriod: t.return_period,
    refundPeriod: t.refund_period,
    nonReturnReasons: t.non_return_reasons ?? [],
    isDefault: t.is_default,
  }));

  return NextResponse.json({ success: true, data: templates });
}

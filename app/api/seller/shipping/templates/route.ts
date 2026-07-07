import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createShippingTemplate } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { data, error } = await supabaseAdmin
    .from('shipping_templates')
    .select(
      'template_id, name, fee_type, fee, free_threshold, return_fee, origin_address, return_address, is_default, created_at'
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
    feeType: t.fee_type,
    fee: t.fee,
    freeThreshold: t.free_threshold,
    returnFee: t.return_fee,
    originAddress: t.origin_address,
    returnAddress: t.return_address,
    isDefault: t.is_default,
  }));

  return NextResponse.json({ success: true, data: templates });
}

export async function POST(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { name, feeType, fee, freeThreshold, returnFee, originAddress, returnAddress, isDefault } =
    body;

  if (
    !name ||
    !feeType ||
    fee === undefined ||
    returnFee === undefined ||
    !originAddress ||
    !returnAddress
  ) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const { templateId } = await createShippingTemplate({
      sellerId: sellerCtx.sellerId,
      name,
      feeType,
      fee: Number(fee),
      freeThreshold: freeThreshold != null ? Number(freeThreshold) : null,
      returnFee: Number(returnFee),
      originAddress,
      returnAddress,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, data: { templateId } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '배송 템플릿 등록에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

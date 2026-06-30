import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateShippingTemplate, deleteShippingTemplate } from './db';

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { templateId } = await params;
  const templateIdNum = Number(templateId);

  if (!templateIdNum || Number.isNaN(templateIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 템플릿 ID입니다.' }, { status: 400 });
  }

  const body = await req.json();
  const { name, feeType, fee, freeThreshold, returnFee, originAddress, returnAddress } = body;

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
    const { templateId: updatedId } = await updateShippingTemplate({
      sellerId: sellerCtx.sellerId,
      templateId: templateIdNum,
      name,
      feeType,
      fee: Number(fee),
      freeThreshold: freeThreshold != null ? Number(freeThreshold) : null,
      returnFee: Number(returnFee),
      originAddress,
      returnAddress,
    });

    return NextResponse.json({ success: true, data: { templateId: updatedId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '배송 템플릿 수정에 실패했습니다.';
    const status =
      message === '템플릿을 찾을 수 없습니다.'
        ? 404
        : message === '해당 템플릿을 수정할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { templateId } = await params;
  const templateIdNum = Number(templateId);

  if (!templateIdNum || Number.isNaN(templateIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 템플릿 ID입니다.' }, { status: 400 });
  }

  try {
    const { newDefaultTemplateId } = await deleteShippingTemplate(
      sellerCtx.sellerId,
      templateIdNum
    );
    return NextResponse.json({
      success: true,
      data: { templateId: templateIdNum, newDefaultTemplateId },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '배송 템플릿 삭제에 실패했습니다.';
    const status =
      message === '템플릿을 찾을 수 없습니다.'
        ? 404
        : message === '해당 템플릿을 삭제할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

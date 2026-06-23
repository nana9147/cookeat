import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { setDefaultReturnPolicyTemplate } from '../db';

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

  try {
    const { templateId: updatedId } = await setDefaultReturnPolicyTemplate({
      sellerId: sellerCtx.sellerId,
      templateId: templateIdNum,
    });

    return NextResponse.json({ success: true, data: { templateId: updatedId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '기본 템플릿 설정에 실패했습니다.';
    const status =
      message === '템플릿을 찾을 수 없습니다.'
        ? 404
        : message === '해당 템플릿을 수정할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { updateSellerProductStatus } from '../db';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

const VALID_STATUSES = ['판매중', '품절', '판매종료', '숨김'];

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productId } = await params;
  const productIdNum = Number(productId);

  if (!productIdNum || Number.isNaN(productIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 상품 ID입니다.' }, { status: 400 });
  }

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 상태입니다.' },
      { status: 400 }
    );
  }

  try {
    await updateSellerProductStatus(sellerCtx.sellerId, productIdNum, status);
    return NextResponse.json({ success: true, data: { productId: productIdNum, status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
    const httpStatus =
      message === '상품을 찾을 수 없습니다.'
        ? 404
        : message === '해당 상품을 수정할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status: httpStatus });
  }
}

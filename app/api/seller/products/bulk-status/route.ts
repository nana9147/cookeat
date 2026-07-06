import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkUpdateProductStatus } from '../db';

export async function PATCH(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productIds, status } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ success: false, error: '상품을 선택해주세요.' }, { status: 400 });
  }
  const VALID_BULK_STATUSES = ['판매중', '품절', '판매종료', '숨김'];

  if (!VALID_BULK_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 상태입니다.' },
      { status: 400 }
    );
  }

  try {
    const { successCount, failCount } = await bulkUpdateProductStatus(
      sellerCtx.sellerId,
      productIds,
      status
    );
    return NextResponse.json({ success: true, data: { successCount, failCount } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '일괄 처리에 실패했습니다.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

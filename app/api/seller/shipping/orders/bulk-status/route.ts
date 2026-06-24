import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkUpdateShippingStatus } from '../db';

export async function PATCH(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { orderIds, status } = body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ success: false, error: '선택된 주문이 없습니다.' }, { status: 400 });
  }
  if (!status) {
    return NextResponse.json(
      { success: false, error: '변경할 상태를 입력해주세요.' },
      { status: 400 }
    );
  }

  const results = await bulkUpdateShippingStatus(sellerCtx.sellerId, orderIds, status);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  return NextResponse.json({
    success: true,
    data: { results, successCount, failCount },
  });
}

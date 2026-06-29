import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkUpdateShippingStatus } from '../db';

export async function PATCH(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { itemIds, status } = body;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return NextResponse.json({ success: false, error: '처리할 항목이 없습니다.' }, { status: 400 });
  }

  const results = await bulkUpdateShippingStatus(sellerCtx.sellerId, itemIds, status);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  return NextResponse.json({
    success: true,
    data: { results, successCount, failCount },
  });
}

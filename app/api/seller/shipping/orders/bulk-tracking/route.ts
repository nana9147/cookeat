import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkUpdateShippingTracking } from '../db';

export async function PATCH(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json(
      { success: false, error: '업로드할 데이터가 없습니다.' },
      { status: 400 }
    );
  }

  const result = await bulkUpdateShippingTracking(sellerCtx.sellerId, updates);

  return NextResponse.json({ success: true, data: result });
}

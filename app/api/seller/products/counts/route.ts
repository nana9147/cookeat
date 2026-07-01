import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerProductCounts } from '../db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  try {
    const counts = await getSellerProductCounts(sellerCtx.sellerId);
    return NextResponse.json({ success: true, data: counts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '상태별 건수를 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

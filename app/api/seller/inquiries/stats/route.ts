import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerInquiryStats } from '../db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  try {
    const stats = await getSellerInquiryStats(sellerCtx.sellerId);
    return NextResponse.json({ data: stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : '통계를 불러오지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

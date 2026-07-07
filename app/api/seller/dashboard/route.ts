import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerDashboard } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  try {
    const dashboard = await getSellerDashboard(sellerCtx.sellerId);
    return NextResponse.json({ success: true, data: dashboard });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '대시보드 정보를 불러오지 못했습니다.';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

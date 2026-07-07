import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerStatistics } from './db';

const VALID_PERIODS = [7, 30, 90];

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const days = Number(searchParams.get('days') ?? '30');
  const validDays = VALID_PERIODS.includes(days) ? days : 30;

  try {
    const data = await getSellerStatistics(sellerCtx.sellerId, validDays);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : '통계를 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

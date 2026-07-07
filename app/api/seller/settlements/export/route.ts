import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerSettlementsForExport } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const keyword = searchParams.get('keyword') ?? undefined;
  const settlementIdsParam = searchParams.get('settlementIds');
  const settlementIds = settlementIdsParam ? settlementIdsParam.split(',').map(Number) : undefined;

  const rows = await getSellerSettlementsForExport(sellerCtx.sellerId, {
    status,
    keyword,
    settlementIds,
  });

  return NextResponse.json({ success: true, data: rows });
}

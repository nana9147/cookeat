import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getRefundsForExport } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const offset = Number(searchParams.get('offset') ?? '0');
  const limit = Math.min(Number(searchParams.get('limit') ?? '1000'), 1000);
  const refundIdsParam = searchParams.get('refundIds');
  const refundIds = refundIdsParam ? refundIdsParam.split(',').map(Number) : undefined;

  const { orders, total } = await getRefundsForExport(sellerCtx.sellerId, {
    offset,
    limit,
    refundIds,
  });

  return NextResponse.json({ success: true, data: { orders, total } });
}

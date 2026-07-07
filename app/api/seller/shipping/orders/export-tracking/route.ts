import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerShippingOrdersForTrackingExport } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const rows = await getSellerShippingOrdersForTrackingExport(sellerCtx.sellerId);

  return NextResponse.json({ success: true, data: rows });
}

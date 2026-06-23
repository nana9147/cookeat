import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerShippingOrderCounts } from '../db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const counts = await getSellerShippingOrderCounts(sellerCtx.sellerId);

  return NextResponse.json({ success: true, data: counts });
}

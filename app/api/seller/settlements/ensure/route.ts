import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { ensureSettlements } from '../db';

export async function POST(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  await ensureSettlements(sellerCtx.sellerId);
  return NextResponse.json({ success: true });
}

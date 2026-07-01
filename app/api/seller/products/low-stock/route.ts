import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerLowStockProducts } from '../db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  try {
    const products = await getSellerLowStockProducts(sellerCtx.sellerId);
    return NextResponse.json({ success: true, data: products });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '재고 부족 상품을 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

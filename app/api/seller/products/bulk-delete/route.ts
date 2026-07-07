import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkDeleteSellerProducts } from '../db';

export async function DELETE(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productIds } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ success: false, error: '상품을 선택해주세요.' }, { status: 400 });
  }

  const { successCount, failures } = await bulkDeleteSellerProducts(sellerCtx.sellerId, productIds);

  return NextResponse.json({ success: true, data: { successCount, failures } });
}
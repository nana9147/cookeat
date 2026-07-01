import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { bulkImportSellerProducts } from '../db';

export async function POST(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { rows } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ success: false, error: '등록할 상품이 없습니다.' }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json(
      { success: false, error: '한 번에 최대 500개까지 등록할 수 있습니다.' },
      { status: 400 }
    );
  }

  const { successCount, failures } = await bulkImportSellerProducts(sellerCtx.sellerId, rows);
  return NextResponse.json({ success: true, data: { successCount, failures } });
}

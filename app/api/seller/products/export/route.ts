import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerProductsForExport } from '../db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const offset = Number(searchParams.get('offset') ?? '0');
  const limit = Math.min(Number(searchParams.get('limit') ?? '1000'), 1000);
  const keyword = searchParams.get('keyword') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const categoryId = searchParams.get('categoryId');
  const parentId = searchParams.get('parentId');
  const productIds = searchParams.get('productIds');

  try {
    const { rows, total } = await getSellerProductsForExport(sellerCtx.sellerId, {
      offset,
      limit,
      keyword,
      status,
      categoryId: categoryId ? Number(categoryId) : undefined,
      parentId: parentId ? Number(parentId) : undefined,
      productIds: productIds ? productIds.split(',').map(Number) : undefined,
    });

    return NextResponse.json({ success: true, data: { orders: rows, total } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '엑셀 데이터를 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

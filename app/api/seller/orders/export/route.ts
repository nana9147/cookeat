import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerOrdersForExport } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const offset = Number(searchParams.get('offset') ?? '0');
  const limit = Number(searchParams.get('limit') ?? '1000');
  const orderIdsParam = searchParams.get('orderIds');
  const orderIds = orderIdsParam ? orderIdsParam.split(',') : undefined;
  const statusParam = searchParams.get('status') ?? undefined;
  const status = statusParam === '전체' ? undefined : statusParam;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const keyword = searchParams.get('keyword') ?? undefined;

  if (offset < 0 || limit <= 0) {
    return NextResponse.json(
      { success: false, error: '잘못된 페이지 범위입니다.' },
      { status: 400 }
    );
  }

  const { orders, total } = await getSellerOrdersForExport(sellerCtx.sellerId, {
    offset,
    limit,
    orderIds,
    status,
    startDate,
    endDate,
    keyword,
  });

  return NextResponse.json({
    success: true,
    data: { orders, total },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerShippingOrders } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');
  const keyword = searchParams.get('keyword') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const { orders, total } = await getSellerShippingOrders(sellerCtx.sellerId, {
    page,
    limit,
    keyword,
    status,
  });

  return NextResponse.json({
    success: true,
    data: { orders, pagination: { page, limit, total, hasNext: page * limit < total } },
  });
}

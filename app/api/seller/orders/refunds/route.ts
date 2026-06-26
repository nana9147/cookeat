import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getOrdersWithRefundRequests } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');
  const status = searchParams.get('status') as '환불요청' | '환불' | undefined;

  const { orders, total } = await getOrdersWithRefundRequests(sellerCtx.sellerId, {
    page,
    limit,
    status,
  });

  return NextResponse.json({
    success: true,
    data: { orders, pagination: { page, limit, total } },
  });
}

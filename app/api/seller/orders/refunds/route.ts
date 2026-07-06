import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getOrdersWithRefundRequests } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');
  const tab = searchParams.get('tab') as
    | '전체'
    | '취소요청'
    | '환불요청'
    | '환불진행중'
    | '처리완료'
    | undefined;
  const keyword = searchParams.get('keyword') ?? undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const { orders, total } = await getOrdersWithRefundRequests(sellerCtx.sellerId, {
    page,
    limit,
    tab,
    keyword,
    startDate,
    endDate,
  });

  return NextResponse.json({
    success: true,
    data: { orders, pagination: { page, limit, total } },
  });
}

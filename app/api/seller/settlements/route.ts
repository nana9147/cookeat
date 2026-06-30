import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerSettlements } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');
  const status = searchParams.get('status') ?? undefined;
  const keyword = searchParams.get('keyword') ?? undefined;

  const { settlements, total } = await getSellerSettlements(sellerCtx.sellerId, {
    page,
    limit,
    status,
    keyword,
  });

  return NextResponse.json({
    success: true,
    data: { settlements, pagination: { page, limit, total } },
  });
}

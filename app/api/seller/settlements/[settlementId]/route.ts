import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerSettlementDetail } from '../db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { settlementId } = await params;

  const detail = await getSellerSettlementDetail(sellerCtx.sellerId, Number(settlementId));

  if (!detail) {
    return NextResponse.json(
      { success: false, error: '정산 내역을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: detail });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerOrderDetail } from './db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { orderId } = await params;

  try {
    const detail = await getSellerOrderDetail(sellerCtx.sellerId, orderId);
    return NextResponse.json({ success: true, data: detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : '주문 조회에 실패했습니다.';
    const status = message === '주문을 찾을 수 없습니다.' ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

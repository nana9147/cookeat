import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getOrderRefundDetail } from '../../db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { orderId } = await params;

  try {
    const order = await getOrderRefundDetail(sellerCtx.sellerId, orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '환불 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (e) {
    const message = e instanceof Error ? e.message : '환불 상세를 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

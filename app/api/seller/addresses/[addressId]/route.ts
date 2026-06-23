import { requireSellerContext } from '@/lib/sellerContext';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAddress } from '../db';

interface RouteParams {
  params: Promise<{ addressId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { addressId } = await params;
  const addressIdNum = Number(addressId);

  if (!addressIdNum || Number.isNaN(addressIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 주소 ID입니다.' }, { status: 400 });
  }

  try {
    const result = await deleteAddress(sellerCtx.sellerId, addressIdNum);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '주소 삭제에 실패했습니다.';
    const status =
      message === '주소를 찾을 수 없습니다.'
        ? 404
        : message === '해당 주소를 삭제할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

import { requireSellerContext } from '@/lib/sellerContext';
import { NextRequest, NextResponse } from 'next/server';
import { deleteAddress, updateAddress } from '../db';

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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { addressId } = await params;
  const addressIdNum = Number(addressId);

  if (!addressIdNum || Number.isNaN(addressIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 주소 ID입니다.' }, { status: 400 });
  }

  const body = await req.json();
  const { type, name, zipCode, baseAddress, detailAddress, isDefault } = body;

  if (!type || !name || !zipCode || !baseAddress) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const address = await updateAddress(sellerCtx.sellerId, addressIdNum, {
      type,
      name,
      zipCode,
      baseAddress,
      detailAddress: detailAddress ?? '',
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, data: address });
  } catch (err) {
    const message = err instanceof Error ? err.message : '주소 수정에 실패했습니다.';
    const status =
      message === '주소를 찾을 수 없습니다.'
        ? 404
        : message === '해당 주소를 수정할 권한이 없습니다.'
          ? 403
          : message === '이미 등록된 주소입니다.'
            ? 400
            : message === '최소 1개의 기본 주소가 필요합니다.'
              ? 400
              : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

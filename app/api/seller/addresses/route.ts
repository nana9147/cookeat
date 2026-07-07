import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getAddressesBySellerId, createAddress } from './db';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const addresses = await getAddressesBySellerId(sellerCtx.sellerId);

  return NextResponse.json({ success: true, data: addresses });
}

export async function POST(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { type, name, zipCode, baseAddress, detailAddress, isDefault } = body;

  if (!type || !name || !zipCode || !baseAddress) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const address = await createAddress(sellerCtx.sellerId, {
      type,
      name,
      zipCode,
      baseAddress,
      detailAddress: detailAddress ?? '',
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (err) {
    console.error('POST /api/seller/addresses error:', err);
    const message = err instanceof Error ? err.message : '주소 등록에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

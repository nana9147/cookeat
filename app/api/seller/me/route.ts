import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerBySellerId, updateSeller } from './db';

// app/api/seller/me/route.ts
export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const seller = await getSellerBySellerId(sellerCtx.sellerId);

  if (!seller) {
    return NextResponse.json(
      { success: false, error: '판매자 정보를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      seller_id: seller.seller_id,
      user_id: seller.user_id,
      is_co_representative: seller.is_co_representative,
      representative_name: seller.representative_name,
      cs_phone: seller.cs_phone,
      store_name: seller.store_name,
      business_number: seller.business_number,
      business_address: seller.business_address,
      bank_name: seller.bank_name,
      bank_account: seller.bank_account,
      commission_rate: seller.commission_rate,
      approve_status: seller.approve_status,
      rejected_reason: seller.rejected_reason,
      created_at: seller.created_at,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const body = await req.json();
  const { storeName, representativeName, csPhone, businessAddress, bankName, bankAccount } = body;

  if (!storeName || !representativeName || !csPhone || !bankName || !bankAccount) {
    return NextResponse.json(
      { success: false, error: '필수 항목을 입력해주세요.' },
      { status: 400 }
    );
  }

  const { error } = await updateSeller(sellerCtx.sellerId, {
    storeName,
    representativeName,
    csPhone,
    businessAddress: businessAddress ?? '',
    bankName,
    bankAccount,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerInquiries, type SellerInquiryType } from './db';

const VALID_TYPES: SellerInquiryType[] = ['상품문의', '배송문의', '주문문의'];

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get('type');
  if (typeParam && !VALID_TYPES.includes(typeParam as SellerInquiryType)) {
    return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
  }
  const type = (typeParam as SellerInquiryType) || undefined;

  const answeredParam = searchParams.get('answered');
  const answered =
    answeredParam === 'true' || answeredParam === 'false' ? answeredParam : undefined;
  const keyword = searchParams.get('keyword') ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '10')));

  try {
    const { inquiries, total } = await getSellerInquiries(sellerCtx.sellerId, {
      type,
      answered,
      keyword,
      page,
      limit,
    });

    return NextResponse.json({
      inquiries,
      pagination: { page, limit, total, hasNext: page * limit < total },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '문의 목록을 불러오지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

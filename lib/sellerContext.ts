import { NextRequest, NextResponse } from 'next/server';
import { requireSeller, UserRole } from './serverAuth';
import { supabaseAdmin } from './supabaseAdmin';

export interface SellerContext {
  userId: number;
  sellerId: number;
  role: Exclude<UserRole, 'user'>;
}

export async function requireSellerContext(
  req: NextRequest
): Promise<SellerContext | NextResponse> {
  const authed = await requireSeller(req);
  if (authed instanceof NextResponse) return authed;

  if (authed.role === 'admin') {
    const sellerIdParam = req.nextUrl.searchParams.get('sellerId');
    if (!sellerIdParam) {
      return NextResponse.json({ error: 'sellerId 파라미터가 필요합니다.' }, { status: 400 });
    }
    const sellerId = Number(sellerIdParam);
    const { data: sellerExists } = await supabaseAdmin
      .from('sellers')
      .select('seller_id')
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (!sellerExists) {
      return NextResponse.json({ error: '존재하지 않는 sellerId입니다.' }, { status: 404 });
    }

    return { userId: authed.userId, sellerId, role: authed.role };
  }

  const { data } = await supabaseAdmin
    .from('sellers')
    .select('seller_id')
    .eq('user_id', authed.userId)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: '판매자 정보를 찾을 수 없습니다.' }, { status: 404 });
  }

  return { userId: authed.userId, sellerId: data.seller_id, role: 'seller' };
}

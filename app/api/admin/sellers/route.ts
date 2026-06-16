import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

type ApproveStatus = 'pending' | 'approved' | 'rejected';
type DisplayStatus = '승인' | '대기' | '거절' | '정지';

function toDisplayStatus(approveStatus: ApproveStatus, userStatus: string): DisplayStatus {
  if (userStatus === 'suspended') return '정지';
  if (approveStatus === 'approved') return '승인';
  if (approveStatus === 'pending') return '대기';
  return '거절';
}

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? '';
  const keyword = searchParams.get('keyword') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get('limit') ?? '50')));
  const chargeRange = searchParams.get('chargeRange') ?? 'all';
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('sellers')
    .select(
      `seller_id, user_id, store_name, business_number, business_address,
       bank_name, bank_account, commission_rate, approve_status, rejected_reason,
       representative_name, cs_phone, is_co_representative, created_at,
       users!inner(email, status), products(count)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(`store_name.ilike.%${keyword}%,business_number.ilike.%${keyword}%`);
  }

  if (chargeRange === 'low') query = query.lte('commission_rate', 10);
  else if (chargeRange === 'mid') query = query.gt('commission_rate', 10).lte('commission_rate', 20);
  else if (chargeRange === 'high') query = query.gt('commission_rate', 20);

  if (status === '정지') {
    query = query.eq('users.status', 'suspended');
  } else if (status === '승인') {
    query = query.eq('approve_status', 'approved').eq('users.status', 'active');
  } else if (status === '대기') {
    query = query.eq('approve_status', 'pending').eq('users.status', 'active');
  } else if (status === '거절') {
    query = query.eq('approve_status', 'rejected').eq('users.status', 'active');
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /admin/sellers] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sellerIds = (data ?? []).map((s) => s.seller_id as number);

  // 판매자별 평균 평점: products → reviews
  const ratingMap = new Map<number, number | null>();
  if (sellerIds.length > 0) {
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('seller_id, reviews(rating)')
      .in('seller_id', sellerIds);

    const acc = new Map<number, { sum: number; cnt: number }>();
    for (const p of productsData ?? []) {
      const reviews = (p.reviews as { rating: number }[]) ?? [];
      for (const r of reviews) {
        const prev = acc.get(p.seller_id as number) ?? { sum: 0, cnt: 0 };
        acc.set(p.seller_id as number, { sum: prev.sum + r.rating, cnt: prev.cnt + 1 });
      }
    }
    for (const [id, { sum, cnt }] of acc) {
      ratingMap.set(id, cnt > 0 ? Math.round((sum / cnt) * 10) / 10 : null);
    }
  }

  const sellers = (data ?? []).map((s) => {
    const user = (s.users as unknown) as { email: string; status: string } | null;
    const productCount =
      Array.isArray(s.products) ? ((s.products[0] as { count: number })?.count ?? 0) : 0;
    const approveStatus = s.approve_status as ApproveStatus;
    const userStatus = user?.status ?? 'active';

    return {
      sellerId: s.seller_id,
      storeName: s.store_name,
      businessNumber: s.business_number,
      businessAddress: s.business_address ?? '',
      bankName: s.bank_name,
      bankAccount: s.bank_account,
      commissionRate: s.commission_rate as number,
      representativeName: s.representative_name,
      csPhone: s.cs_phone,
      isCoRepresentative: s.is_co_representative,
      approveStatus,
      rejectedReason: s.rejected_reason ?? null,
      email: user?.email ?? '',
      userStatus,
      status: toDisplayStatus(approveStatus, userStatus) as DisplayStatus,
      productCount,
      rating: ratingMap.get(s.seller_id as number) ?? null,
      createdAt: s.created_at,
    };
  });

  return NextResponse.json({
    sellers,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

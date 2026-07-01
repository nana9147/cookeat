import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { couponId } = await params;
  const id = parseInt(couponId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: '잘못된 쿠폰 ID입니다.' }, { status: 400 });
  }

  const body = await req.json();
  const { userIds, issueAll } = body as { userIds?: unknown; issueAll?: boolean };

  // 대상 userId 목록 확정
  let targetUserIds: number[];

  if (issueAll) {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('user_id')
      .eq('role', 'user')
      .eq('status', 'active');

    if (usersError) {
      console.error('[POST /admin/coupons/[id]/issue] users fetch:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }
    targetUserIds = (users ?? []).map((u) => u.user_id);
  } else {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: '지급할 유저를 선택해주세요.' }, { status: 400 });
    }
    if (userIds.some((uid) => typeof uid !== 'number' || !Number.isInteger(uid))) {
      return NextResponse.json({ error: 'userIds 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    targetUserIds = userIds as number[];
  }

  if (targetUserIds.length === 0) {
    return NextResponse.json({ issuedCount: 0 });
  }

  const { data: coupon, error: couponError } = await supabaseAdmin
    .from('coupons')
    .select('coupon_id, max_usage_count, expired_at')
    .eq('coupon_id', id)
    .single();

  if (couponError || !coupon) {
    return NextResponse.json({ error: '존재하지 않는 쿠폰입니다.' }, { status: 404 });
  }
  if (new Date(coupon.expired_at) < new Date()) {
    return NextResponse.json({ error: '만료된 쿠폰은 지급할 수 없습니다.' }, { status: 400 });
  }

  if (coupon.max_usage_count !== null) {
    const { count, error: countError } = await supabaseAdmin
      .from('user_coupons')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', id);

    if (countError) {
      console.error('[POST /admin/coupons/[id]/issue] count:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    if ((count ?? 0) + targetUserIds.length > coupon.max_usage_count) {
      return NextResponse.json(
        { error: `최대 발급 수량(${coupon.max_usage_count}개)을 초과합니다.` },
        { status: 400 }
      );
    }
  }

  const rows = targetUserIds.map((userId) => ({
    user_id: userId,
    coupon_id: id,
  }));

  const { data, error } = await supabaseAdmin
    .from('user_coupons')
    .upsert(rows, { onConflict: 'user_id,coupon_id', ignoreDuplicates: true })
    .select('id');

  if (error) {
    console.error('[POST /admin/coupons/[id]/issue]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ issuedCount: data?.length ?? 0 });
}

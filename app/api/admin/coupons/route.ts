import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';
import { getActiveUserIds, isIssueFailure, issueCouponToUsers } from '@/lib/coupons';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const couponsRes = await supabaseAdmin
    .from('coupons')
    .select('coupon_id, code, discount_type, discount_value, min_order_amount, max_usage_count, expired_at, created_at')
    .order('created_at', { ascending: false });

  if (couponsRes.error) {
    console.error('[GET /admin/coupons]', couponsRes.error);
    return NextResponse.json({ error: couponsRes.error.message }, { status: 500 });
  }

  const couponIds = (couponsRes.data ?? []).map((c) => c.coupon_id);
  const statsByCoupon: Record<number, { issuedCount: number; usedCount: number }> = {};

  if (couponIds.length > 0) {
    const userCouponsRes = await supabaseAdmin
      .from('user_coupons')
      .select('coupon_id, used_at')
      .in('coupon_id', couponIds);

    if (userCouponsRes.error) {
      console.error('[GET /admin/coupons] user_coupons:', userCouponsRes.error);
      return NextResponse.json({ error: userCouponsRes.error.message }, { status: 500 });
    }

    for (const uc of userCouponsRes.data ?? []) {
      if (!statsByCoupon[uc.coupon_id]) {
        statsByCoupon[uc.coupon_id] = { issuedCount: 0, usedCount: 0 };
      }
      statsByCoupon[uc.coupon_id].issuedCount++;
      if (uc.used_at) statsByCoupon[uc.coupon_id].usedCount++;
    }
  }

  const coupons = (couponsRes.data ?? []).map((c) => ({
    couponId: c.coupon_id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: c.discount_value,
    minOrderAmount: c.min_order_amount,
    maxUsageCount: c.max_usage_count,
    issuedCount: statsByCoupon[c.coupon_id]?.issuedCount ?? 0,
    usedCount: statsByCoupon[c.coupon_id]?.usedCount ?? 0,
    expiredAt: c.expired_at,
    createdAt: c.created_at,
  }));

  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { code, discountType, discountValue, minOrderAmount, maxUsageCount, expiredAt } = body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: '쿠폰 코드를 입력해주세요.' }, { status: 400 });
  }
  if (discountType !== 'rate' && discountType !== 'fixed') {
    return NextResponse.json({ error: '할인 유형이 올바르지 않습니다.' }, { status: 400 });
  }
  if (typeof discountValue !== 'number' || discountValue <= 0) {
    return NextResponse.json({ error: '할인 값은 0보다 커야 합니다.' }, { status: 400 });
  }
  if (discountType === 'rate' && discountValue > 100) {
    return NextResponse.json({ error: '정률 할인은 100% 이하여야 합니다.' }, { status: 400 });
  }
  if (!expiredAt) {
    return NextResponse.json({ error: '만료일을 입력해주세요.' }, { status: 400 });
  }
  if (new Date(expiredAt) <= new Date()) {
    return NextResponse.json({ error: '만료일은 현재 시각 이후여야 합니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: minOrderAmount ?? null,
      max_usage_count: maxUsageCount ?? null,
      expired_at: expiredAt,
    })
    .select('coupon_id, code, discount_type, discount_value, min_order_amount, max_usage_count, expired_at, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 409 });
    }
    console.error('[POST /admin/coupons]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let activeUserIds: number[];
  try {
    activeUserIds = await getActiveUserIds();
  } catch (usersError) {
    console.error('[POST /admin/coupons] users fetch:', usersError);
    await supabaseAdmin.from('coupons').delete().eq('coupon_id', data.coupon_id);
    return NextResponse.json({ error: '유저 목록을 불러오지 못했습니다.' }, { status: 500 });
  }

  const issueResult = await issueCouponToUsers(data.coupon_id, activeUserIds, data.max_usage_count);
  if (isIssueFailure(issueResult)) {
    console.error('[POST /admin/coupons] issue:', issueResult.error);
    await supabaseAdmin.from('coupons').delete().eq('coupon_id', data.coupon_id);
    return NextResponse.json(
      { error: `쿠폰 지급에 실패하여 생성이 취소되었습니다. (${issueResult.error})` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    couponId: data.coupon_id,
    code: data.code,
    discountType: data.discount_type,
    discountValue: data.discount_value,
    minOrderAmount: data.min_order_amount,
    maxUsageCount: data.max_usage_count,
    issuedCount: issueResult.issuedCount,
    usedCount: 0,
    expiredAt: data.expired_at,
    createdAt: data.created_at,
  }, { status: 201 });
}

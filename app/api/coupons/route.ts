import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const amount = parseInt(searchParams.get('amount') ?? '0', 10);

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('coupon_id, code, discount_type, discount_value, min_order_amount, max_usage_count, current_usage_count, expired_at')
    .gt('expired_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const validCoupons = (data ?? []).filter(
    (c) => c.max_usage_count === null || c.current_usage_count < c.max_usage_count,
  );

  // 현재 유저가 이미 사용한 쿠폰 ID 목록 조회
  const couponIds = validCoupons.map((c) => c.coupon_id);
  const usedCouponIds = new Set<number>();
  if (couponIds.length > 0) {
    const { data: usedUserCoupons } = await supabaseAdmin
      .from('user_coupons')
      .select('coupon_id')
      .eq('user_id', authed.userId)
      .not('used_at', 'is', null)
      .in('coupon_id', couponIds);
    (usedUserCoupons ?? []).forEach((uc) => usedCouponIds.add(uc.coupon_id as number));
  }

  const coupons = validCoupons
    .filter((c) => !usedCouponIds.has(c.coupon_id))
    .map((c) => {
      const discountAmount =
        c.discount_type === 'rate'
          ? Math.floor(amount * c.discount_value / 100)
          : c.discount_value;
      const usable = c.min_order_amount === null || amount >= c.min_order_amount;
      return {
        couponId: c.coupon_id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        discountAmount,
        minOrderAmount: c.min_order_amount,
        expiredAt: c.expired_at,
        usable,
      };
    });

  return NextResponse.json({ coupons });
}

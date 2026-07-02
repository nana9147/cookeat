import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.trim();
  const amount = parseInt(searchParams.get('amount') ?? '0', 10);

  if (!code) {
    return NextResponse.json({ error: '쿠폰 코드를 입력해주세요.' }, { status: 400 });
  }

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('coupon_id, code, discount_type, discount_value, min_order_amount, max_usage_count, current_usage_count, expired_at')
    .eq('code', code)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: '존재하지 않는 쿠폰 코드입니다.' }, { status: 404 });
  }

  if (new Date(coupon.expired_at) < new Date()) {
    return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
  }

  if (
    coupon.max_usage_count !== null &&
    coupon.current_usage_count >= coupon.max_usage_count
  ) {
    return NextResponse.json({ error: '사용 가능 횟수를 초과한 쿠폰입니다.' }, { status: 400 });
  }

  const { count } = await supabaseAdmin
    .from('user_coupons')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', authed.userId)
    .eq('coupon_id', coupon.coupon_id)
    .not('used_at', 'is', null);

  if (count && count > 0) {
    return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
  }

  if (coupon.min_order_amount !== null && amount < coupon.min_order_amount) {
    return NextResponse.json(
      { error: `최소 주문 금액 ${coupon.min_order_amount.toLocaleString()}원 이상 시 사용 가능합니다.` },
      { status: 400 }
    );
  }

  const discountAmount =
    coupon.discount_type === 'rate'
      ? Math.floor(amount * coupon.discount_value / 100)
      : coupon.discount_value;

  return NextResponse.json({
    couponId: coupon.coupon_id,
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discountAmount,
    minOrderAmount: coupon.min_order_amount,
  });
}

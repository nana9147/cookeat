import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const amount = parseInt(searchParams.get('amount') ?? '0', 10);

  const { data, error } = await supabaseAdmin
    .from('user_coupons')
    .select(
      'id, issued_at, coupons(coupon_id, discount_type, discount_value, min_order_amount, expired_at)'
    )
    .eq('user_id', authed.userId)
    .is('used_at', null);

  if (error) {
    console.error('[GET /coupons/mine]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();

  const coupons = (data ?? [])
    .map((uc) => {
      const c = uc.coupons as unknown as {
        coupon_id: number;
        discount_type: 'rate' | 'fixed';
        discount_value: number;
        min_order_amount: number | null;
        expired_at: string;
      } | null;
      if (!c) return null;

      if (new Date(c.expired_at) < now) return null;

      const discountAmount =
        c.discount_type === 'rate'
          ? Math.floor(amount * c.discount_value / 100)
          : c.discount_value;

      return {
        userCouponId: uc.id,
        couponId: c.coupon_id,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        minOrderAmount: c.min_order_amount,
        expiredAt: c.expired_at,
        issuedAt: uc.issued_at,
        discountAmount,
        usable: amount === 0 || c.min_order_amount === null || amount >= c.min_order_amount,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ coupons });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { couponId } = await params;
  const id = parseInt(couponId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 쿠폰 ID입니다.' }, { status: 400 });
  }

  const { count, error: usedCheckError } = await supabaseAdmin
    .from('user_coupons')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', id)
    .not('used_at', 'is', null);

  if (usedCheckError) {
    console.error('[DELETE /admin/coupons] used check:', usedCheckError);
    return NextResponse.json({ error: usedCheckError.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: '이미 사용된 쿠폰은 삭제할 수 없습니다.' },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin.from('coupons').delete().eq('coupon_id', id);

  if (error) {
    console.error('[DELETE /admin/coupons]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

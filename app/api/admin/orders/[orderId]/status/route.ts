import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['결제완료', '주문확인', '배송준비', '배송중', '배송완료', '취소'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const authed = await requireAdmin(req);
    if (authed instanceof NextResponse) return authed;

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'invalid orderId' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (error) {
      console.error('[PATCH /admin/orders/:orderId/status] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /admin/orders/:orderId/status] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

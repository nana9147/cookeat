import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_APPROVE_STATUSES = ['approved', 'rejected', 'pending'] as const;
type ApproveStatus = (typeof VALID_APPROVE_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> },
) {
  try {
    const authed = await requireAdmin(req);
    if (authed instanceof NextResponse) return authed;

    const { sellerId } = await params;
    const sellerIdNum = parseInt(sellerId);
    if (isNaN(sellerIdNum)) {
      return NextResponse.json({ error: 'invalid sellerId' }, { status: 400 });
    }

    const body = await req.json();
    const { status, reason, suspend, commissionRate } = body as {
      status?: ApproveStatus;
      reason?: string;
      suspend?: boolean;
      commissionRate?: number;
    };

    if (status !== undefined && !VALID_APPROVE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    if (
      commissionRate !== undefined &&
      (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100)
    ) {
      return NextResponse.json({ error: 'invalid commissionRate' }, { status: 400 });
    }

    const { data: seller, error: fetchError } = await supabaseAdmin
      .from('sellers')
      .select('seller_id, user_id')
      .eq('seller_id', sellerIdNum)
      .single();

    if (fetchError || !seller) {
      return NextResponse.json({ error: 'seller not found' }, { status: 404 });
    }

    // 정지 / 정지 해제
    if (suspend !== undefined) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ status: suspend ? 'suspended' : 'active', updated_at: new Date().toISOString() })
        .eq('user_id', seller.user_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 승인 상태 변경
    if (status !== undefined) {
      const sellerUpdate: Record<string, string | null> = { approve_status: status };
      sellerUpdate.rejected_reason = status === 'rejected' ? (reason ?? null) : null;

      const { error } = await supabaseAdmin
        .from('sellers')
        .update(sellerUpdate)
        .eq('seller_id', sellerIdNum);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 승인 시 계정 활성화 (suspend가 명시적으로 지정된 경우 우선)
      if (status === 'approved' && !suspend) {
        await supabaseAdmin
          .from('users')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('user_id', seller.user_id);
      }
    }

    // 수수료율 변경
    if (commissionRate !== undefined) {
      const { error } = await supabaseAdmin
        .from('sellers')
        .update({ commission_rate: commissionRate })
        .eq('seller_id', sellerIdNum);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /admin/sellers/:sellerId/approve] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

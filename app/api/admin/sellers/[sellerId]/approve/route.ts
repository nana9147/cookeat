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

    // users.status / sellers.approve_status / commission_rate를 하나의 트랜잭션(RPC)으로 처리
    // — 개별 update로 나누면 중간 실패 시 두 테이블 상태가 어긋날 수 있어 원자적으로 묶음
    const { error } = await supabaseAdmin.rpc('admin_update_seller_status', {
      p_seller_id: sellerIdNum,
      p_user_id: seller.user_id,
      p_suspend: suspend ?? null,
      p_approve_status: status ?? null,
      p_rejected_reason: reason ?? null,
      p_commission_rate: commissionRate ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /admin/sellers/:sellerId/approve] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['대기', '완료'] as const;
type SettlementStatus = (typeof VALID_STATUSES)[number];

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? '';
  const startDate = searchParams.get('startDate') ?? '';
  const endDate = searchParams.get('endDate') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 일괄 정산용: 페이지네이션 없이 대상 settlement_id 전체를 반환 (목록 조회의 100건 상한과 무관)
  if (searchParams.get('bulkIds') === 'true') {
    let idQuery = supabaseAdmin.from('settlements').select('settlement_id').eq('status', '대기');
    if (startDate) idQuery = idQuery.gte('period_start', startDate);
    if (endDate) idQuery = idQuery.lte('period_end', endDate);

    const { data, error } = await idQuery;
    if (error) {
      console.error('[GET /admin/settlements?bulkIds] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ settlementIds: (data ?? []).map((r) => r.settlement_id) });
  }

  let query = supabaseAdmin
    .from('settlements')
    .select(
      `settlement_id, seller_id, amount, fee, status, period_start, period_end,
       settled_at, created_at,
       sellers(store_name, bank_name, bank_account, commission_rate)`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status && VALID_STATUSES.includes(status as SettlementStatus)) {
    query = query.eq('status', status);
  }
  if (startDate) {
    query = query.gte('period_start', startDate);
  }
  if (endDate) {
    query = query.lte('period_end', endDate);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /admin/settlements] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type SettlementStatsRow = {
    pending_count: number;
    pending_amount: number;
    completed_count: number;
    completed_amount: number;
    total_fee: number;
  };

  const { data: statsData, error: statsError } = await supabaseAdmin
    .rpc('admin_settlement_stats')
    .single();

  if (statsError) {
    console.error('[GET /admin/settlements] stats error:', statsError);
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  const statsRow = statsData as SettlementStatsRow;

  const stats = {
    pendingCount: statsRow.pending_count ?? 0,
    pendingAmount: statsRow.pending_amount ?? 0,
    completedCount: statsRow.completed_count ?? 0,
    completedAmount: statsRow.completed_amount ?? 0,
    totalFee: statsRow.total_fee ?? 0,
  };

  type RawSeller = {
    store_name: string;
    bank_name: string;
    bank_account: string;
    commission_rate: number;
  };

  const settlements = (data ?? []).map((s) => {
    const seller = s.sellers as unknown as RawSeller | null;
    return {
      settlementId: s.settlement_id,
      sellerId: s.seller_id,
      storeName: seller?.store_name ?? '(알 수 없음)',
      bankName: seller?.bank_name ?? '',
      bankAccount: seller?.bank_account ?? '',
      commissionRate: seller?.commission_rate ?? 15,
      amount: s.amount,
      fee: s.fee,
      status: s.status as SettlementStatus,
      periodStart: s.period_start,
      periodEnd: s.period_end,
      settledAt: s.settled_at,
      createdAt: s.created_at,
    };
  });

  return NextResponse.json({
    settlements,
    stats,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

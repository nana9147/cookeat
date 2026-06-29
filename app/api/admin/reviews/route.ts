import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 통계: 전체 리뷰 수 + 상태별 카운트 병렬 조회
  const [totalResult, pendingResult] = await Promise.all([
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }).eq('status', '신고'),
  ]);

  const stats = {
    total: totalResult.count ?? 0,
    pendingReports: pendingResult.count ?? 0,
  };

  let query = supabaseAdmin
    .from('reviews')
    .select(
      `review_id, rating, content, created_at, status,
       users!inner(nickname, email),
       products!left(name),
       recipes!left(title)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.ilike('content', `%${keyword}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviewIds = (data ?? []).map((r) => r.review_id as number);

  // 신고 집계: 리뷰별 신고 수 + 신고자 정보
  type ReportRow = {
    review_id: number;
    reason: string;
    created_at: string;
    users: { nickname: string } | null;
  };

  const { data: reportRows } =
    reviewIds.length > 0
      ? await supabaseAdmin
          .from('review_reports')
          .select('review_id, reason, created_at, users!inner(nickname)')
          .in('review_id', reviewIds)
          .order('created_at', { ascending: false })
      : { data: [] as ReportRow[] };

  const reportMap = new Map<
    number,
    { count: number; list: { reporter: string; date: string; reason: string }[] }
  >();
  for (const rep of (reportRows as unknown as ReportRow[]) ?? []) {
    const entry = reportMap.get(rep.review_id) ?? { count: 0, list: [] };
    entry.count++;
    entry.list.push({
      reporter: rep.users?.nickname ?? '(알 수 없음)',
      date: new Date(rep.created_at).toLocaleDateString('ko-KR'),
      reason: rep.reason,
    });
    reportMap.set(rep.review_id, entry);
  }

  type RawUser = { nickname: string; email: string };
  type RawProduct = { name: string } | null;
  type RawRecipe = { title: string } | null;

  const reviews = (data ?? []).map((r) => {
    const user = r.users as unknown as RawUser | null;
    const product = r.products as unknown as RawProduct;
    const recipe = r.recipes as unknown as RawRecipe;
    const reportInfo = reportMap.get(r.review_id as number);
    return {
      reviewId: r.review_id,
      author: user?.nickname ?? '(알 수 없음)',
      authorEmail: user?.email ?? '',
      targetName: product?.name ?? recipe?.title ?? '(알 수 없음)',
      targetType: product ? ('product' as const) : ('recipe' as const),
      rating: r.rating as number,
      content: r.content as string,
      createdAt: r.created_at,
      state: r.status as string,
      reportCount: reportInfo?.count ?? 0,
      reports: reportInfo?.list ?? [],
    };
  });

  return NextResponse.json({
    stats,
    reviews,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

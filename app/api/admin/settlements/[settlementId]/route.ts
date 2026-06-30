import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { settlementId } = await params;
  const id = parseInt(settlementId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '잘못된 settlementId입니다.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 본문을 파싱할 수 없습니다.' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    (body as Record<string, unknown>).status !== '완료'
  ) {
    return NextResponse.json({ error: 'status는 "완료"만 허용됩니다.' }, { status: 400 });
  }

  // 대기 상태인지 먼저 확인
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('settlements')
    .select('status')
    .eq('settlement_id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: '정산 내역을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (existing.status === '완료') {
    return NextResponse.json({ error: '이미 완료된 정산입니다.' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('settlements')
    .update({ status: '완료', settled_at: new Date().toISOString() })
    .eq('settlement_id', id)
    .select('settlement_id, status, settled_at')
    .single();

  if (error) {
    console.error('[PATCH /admin/settlements/:id] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    settlementId: data.settlement_id,
    status: data.status,
    settledAt: data.settled_at,
  });
}

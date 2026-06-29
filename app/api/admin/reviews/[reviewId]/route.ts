import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['정상', '신고'] as const;
type ReviewStatus = (typeof VALID_STATUSES)[number];

async function resolveId(params: Promise<{ reviewId: string }>) {
  const { reviewId } = await params;
  const id = parseInt(reviewId);
  return isNaN(id) ? null : id;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const id = await resolveId(params);
  if (id === null) return NextResponse.json({ error: '유효하지 않은 리뷰 ID입니다.' }, { status: 400 });

  const body = await req.json();
  const status = body.status as string | undefined;

  if (!status || !VALID_STATUSES.includes(status as ReviewStatus)) {
    return NextResponse.json(
      { error: `status는 ${VALID_STATUSES.join(' | ')} 중 하나여야 합니다.` },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from('reviews')
    .update({ status })
    .eq('review_id', id);

  if (error) {
    console.error('[PATCH /api/admin/reviews/:reviewId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const id = await resolveId(params);
  if (id === null) return NextResponse.json({ error: '유효하지 않은 리뷰 ID입니다.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('reviews').delete().eq('review_id', id);
  if (error) {
    console.error('[DELETE /api/admin/reviews/:reviewId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

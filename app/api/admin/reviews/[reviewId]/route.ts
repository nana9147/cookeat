import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { reviewId } = await params;
  const id = parseInt(reviewId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 리뷰 ID입니다.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('reviews').delete().eq('review_id', id);
  if (error) {
    console.error('[DELETE /api/admin/reviews/:reviewId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

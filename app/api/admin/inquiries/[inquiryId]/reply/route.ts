import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inquiryId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { inquiryId } = await params;
  const id = parseInt(inquiryId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim() ?? '';
  if (!content) {
    return NextResponse.json({ error: '답변 내용을 입력해 주세요.' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('inquiry_replies')
    .select('reply_id')
    .eq('inquiry_id', id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: '이미 답변된 문의입니다.' }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from('inquiry_replies').insert({
    inquiry_id: id,
    admin_id: authed.userId,
    content,
  });

  if (error) {
    console.error('[POST /api/admin/inquiries/:inquiryId/reply]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

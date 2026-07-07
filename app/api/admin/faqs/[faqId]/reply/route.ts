import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { faqId } = await params;
  const id = parseInt(faqId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim() ?? '';
  if (!content) {
    return NextResponse.json({ error: '답변 내용을 입력해 주세요.' }, { status: 400 });
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from('faq_replies')
    .select('reply_id')
    .eq('faq_id', id)
    .maybeSingle();

  if (checkError) {
    console.error('[POST /api/admin/faqs/:faqId/reply] duplicate check error:', checkError);
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: '이미 답변된 문의입니다.' }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from('faq_replies').insert({
    faq_id: id,
    admin_id: authed.userId,
    content,
  });

  if (error) {
    console.error('[POST /api/admin/faqs/:faqId/reply]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

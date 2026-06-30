import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { faqId } = await params;
  const id = parseInt(faqId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 FAQ ID입니다.' }, { status: 400 });
  }

  const body = await req.json();
  const { category, title, content, is_public } = body;

  if (category === '' || title === '' || content === '') {
    return NextResponse.json({ error: '항목에 빈 값을 입력할 수 없습니다.' }, { status: 400 });
  }
  if (is_public !== undefined && typeof is_public !== 'boolean') {
    return NextResponse.json({ error: 'is_public은 boolean이어야 합니다.' }, { status: 400 });
  }
  if (category === undefined && title === undefined && content === undefined && is_public === undefined) {
    return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .update({ category, title, content, is_public, updated_at: new Date().toISOString() })
    .eq('faq_id', id)
    .select()
    .single();

  if (error) {
    console.error('[PATCH /api/admin/faqs/:faqId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ faq: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ faqId: string }> }
) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { faqId } = await params;
  const id = parseInt(faqId);
  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 FAQ ID입니다.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('faqs').delete().eq('faq_id', id);
  if (error) {
    console.error('[DELETE /api/admin/faqs/:faqId]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

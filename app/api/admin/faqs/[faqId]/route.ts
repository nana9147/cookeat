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

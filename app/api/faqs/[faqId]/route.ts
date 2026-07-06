import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ faqId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { faqId } = await params;
  const id = Number(faqId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .select(`faq_id, category, title, content, created_at, faq_replies(reply_id, content, created_at)`)
    .eq('faq_id', id)
    .eq('user_id', authed.userId)
    .single();

  if (error || !data) return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });

  type ReplyRow = { reply_id: number; content: string; created_at: string };
  type Row = {
    faq_id: number; category: string; title: string; content: string; created_at: string;
    faq_replies: ReplyRow[] | ReplyRow | null;
  };
  const r = data as unknown as Row;
  const raw = r.faq_replies;
  const replies: ReplyRow[] = raw === null || raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];

  return NextResponse.json({
    inquiryId: r.faq_id, category: r.category, title: r.title, content: r.content,
    createdAt: r.created_at, isAnswered: replies.length > 0,
    reply: replies[0] ? { content: replies[0].content, createdAt: replies[0].created_at } : null,
  });
}

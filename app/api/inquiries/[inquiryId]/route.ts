import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ inquiryId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { inquiryId } = await params;
  const id = Number(inquiryId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select(
      `inquiry_id, category, title, content, created_at,
       inquiry_replies(reply_id, content, created_at),
       inquiry_images(url)`
    )
    .eq('inquiry_id', id)
    .eq('user_id', authed.userId)
    .single();

  if (error || !data) return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });

  type ReplyRow = { reply_id: number; content: string; created_at: string };
  type ImageRow = { url: string };
  type Row = {
    inquiry_id: number; category: string; title: string; content: string; created_at: string;
    inquiry_replies: ReplyRow[] | ReplyRow | null;
    inquiry_images: ImageRow[] | null;
  };
  const r = data as unknown as Row;
  const raw = r.inquiry_replies;
  const replies: ReplyRow[] = raw === null || raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];

  return NextResponse.json({
    inquiryId: r.inquiry_id, category: r.category, title: r.title, content: r.content,
    createdAt: r.created_at, isAnswered: replies.length > 0,
    reply: replies[0] ? { content: replies[0].content, createdAt: replies[0].created_at } : null,
    images: (r.inquiry_images ?? []).map((img) => img.url),
  });
}

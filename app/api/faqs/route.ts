import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_CATEGORIES = ['레시피', '쿠폰', '계정'] as const;

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .select(`faq_id, category, title, created_at, faq_replies(reply_id)`)
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ReplyRow = { reply_id: number };
  type Row = { faq_id: number; category: string; title: string; created_at: string; faq_replies: ReplyRow[] | ReplyRow | null };

  const inquiries = ((data as unknown as Row[]) ?? []).map((r) => {
    const raw = r.faq_replies;
    const isAnswered = raw !== null && raw !== undefined && (Array.isArray(raw) ? raw.length > 0 : true);
    return { inquiryId: r.faq_id, category: r.category, title: r.title, isAnswered, createdAt: r.created_at };
  });

  return NextResponse.json({ inquiries });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { category, title, content } = body as { category: string; title: string; content: string };

  if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
  }
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .insert({
      user_id: authed.userId,
      category,
      title: title.trim(),
      content: content.trim(),
      is_public: false,
    })
    .select('faq_id, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { inquiryId: data.faq_id, isAnswered: false, createdAt: data.created_at },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { GENERAL_CATEGORIES, VALID_CATEGORIES } from '@/lib/inquiryCategories';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select(`inquiry_id, category, title, created_at, inquiry_replies(reply_id)`)
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ReplyRow = { reply_id: number };
  type Row = { inquiry_id: number; category: string; title: string; created_at: string; inquiry_replies: ReplyRow[] | ReplyRow | null };

  const inquiries = ((data as unknown as Row[]) ?? []).map((r) => {
    const raw = r.inquiry_replies;
    const isAnswered = raw !== null && raw !== undefined && (Array.isArray(raw) ? raw.length > 0 : true);
    return { inquiryId: r.inquiry_id, category: r.category, title: r.title, isAnswered, createdAt: r.created_at };
  });

  return NextResponse.json({ inquiries });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { category, title, content } = body as {
    category: string;
    title: string;
    content: string;
  };

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
  }
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }
  if (!(GENERAL_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      user_id: authed.userId,
      category,
      title: title.trim(),
      content: content.trim(),
    })
    .select('inquiry_id, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { inquiryId: data.inquiry_id, isAnswered: false, createdAt: data.created_at },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const VALID_CATEGORIES = ['주문문의', '상품문의', '배송문의', '기타'] as const;

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select(`inquiry_id, category, title, created_at, inquiry_replies(id)`)
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type Row = { inquiry_id: number; category: string; title: string; created_at: string; inquiry_replies: { id: number }[] | null };

  const inquiries = ((data as unknown as Row[]) ?? []).map((r) => ({
    inquiryId: r.inquiry_id, category: r.category, title: r.title,
    isAnswered: (r.inquiry_replies?.length ?? 0) > 0, createdAt: r.created_at,
  }));

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
    .from('inquiries')
    .insert({ user_id: authed.userId, category, title: title.trim(), content: content.trim() })
    .select('inquiry_id, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { inquiryId: data.inquiry_id, isAnswered: false, createdAt: data.created_at },
    { status: 201 }
  );
}

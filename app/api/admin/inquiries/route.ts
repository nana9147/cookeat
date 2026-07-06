import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

type RawUser = { nickname: string; email: string };
type RawReply = { reply_id: number; content: string; created_at: string };

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const category = searchParams.get('category') ?? '';
  const answered = searchParams.get('answered');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('inquiries')
    .select(
      `inquiry_id, category, title, content, created_at,
       users!inner(nickname, email),
       inquiry_replies(reply_id, content, created_at)`,
      { count: 'exact' }
    )
    // product_id/order_item_id가 연결된 문의는 판매자 응대 대상이라 관리자 큐에서 제외
    // (카테고리 이름이 아니라 연결값 유무로 판단 — 상품 상세에서 올라온 '기타'도 product_id가 있으면 제외됨)
    .is('product_id', null)
    .is('order_item_id', null)
    .order('created_at', { ascending: false });

  if (keyword) query = query.ilike('title', `%${keyword}%`);
  if (category) query = query.eq('category', category);

  if (answered !== null) {
    const { data, error } = await query;
    if (error) {
      console.error('[GET /api/admin/inquiries]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const all = (data ?? []).map(toInquiry);
    const filtered =
      answered === 'true' ? all.filter((i) => i.isAnswered) : all.filter((i) => !i.isAnswered);
    const total = filtered.length;
    const paginated = filtered.slice(from, to + 1);

    return NextResponse.json({
      inquiries: paginated,
      pagination: { page, limit, total, hasNext: page * limit < total },
    });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error('[GET /api/admin/inquiries]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inquiries: (data ?? []).map(toInquiry),
    pagination: { page, limit, total: count ?? 0, hasNext: page * limit < (count ?? 0) },
  });
}

function toInquiry(i: {
  inquiry_id: number;
  category: string;
  title: string;
  content: string;
  created_at: string;
  users: unknown;
  inquiry_replies: unknown;
}) {
  const user = i.users as RawUser | null;
  const raw = i.inquiry_replies;
  const replies: RawReply[] = raw === null || raw === undefined
    ? []
    : Array.isArray(raw)
      ? (raw as RawReply[])
      : [raw as RawReply];
  const isAnswered = replies.length > 0;
  return {
    inquiryId: i.inquiry_id,
    author: user?.nickname ?? '(알 수 없음)',
    authorEmail: user?.email ?? '',
    category: i.category,
    title: i.title,
    content: i.content,
    isAnswered,
    reply: isAnswered ? { content: replies[0].content, createdAt: replies[0].created_at } : null,
    createdAt: i.created_at,
  };
}

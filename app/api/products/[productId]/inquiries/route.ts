import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getOptionalAuthedUser } from '@/lib/serverAuth';
import { maskNickname } from '@/lib/format';

type Params = { params: Promise<{ productId: string }> };

// 상품문의는 product_id로 연결된 것만 존재하는 카테고리라, product_id 필터만으로 상품문의를 정확히 걸러낸다.
// 공개 게시판으로 노출하되 작성자 본인이 아니면 닉네임을 마스킹한다.
export async function GET(req: NextRequest, { params }: Params) {
  const { productId: raw } = await params;
  const productId = parseInt(raw);
  if (isNaN(productId)) return NextResponse.json({ error: '잘못된 productId' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '10')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const authed = await getOptionalAuthedUser(req);

  const { data, error, count } = await supabaseAdmin
    .from('inquiries')
    .select('inquiry_id, title, content, user_id, created_at, inquiry_replies(content, created_at)', {
      count: 'exact',
    })
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ReplyRow = { content: string; created_at: string };
  type Row = {
    inquiry_id: number;
    title: string;
    content: string;
    user_id: number;
    created_at: string;
    inquiry_replies: ReplyRow[] | ReplyRow | null;
  };
  const rows = (data as unknown as Row[]) ?? [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: usersData } = userIds.length
    ? await supabaseAdmin.from('users').select('user_id, nickname, email').in('user_id', userIds)
    : { data: [] };
  type UserRow = { user_id: number; nickname: string | null; email: string };
  const userMap = new Map((usersData as UserRow[] | null ?? []).map((u) => [u.user_id, u]));

  const inquiries = rows.map((r) => {
    const u = userMap.get(r.user_id);
    const nickname = u?.nickname ?? u?.email?.split('@')[0] ?? '(알 수 없음)';
    const isMine = authed?.userId === r.user_id;
    const rawReply = r.inquiry_replies;
    const reply = rawReply == null ? null : Array.isArray(rawReply) ? rawReply[0] ?? null : rawReply;

    return {
      inquiryId: r.inquiry_id,
      title: r.title,
      content: r.content,
      author: isMine ? nickname : maskNickname(nickname),
      isMine,
      isAnswered: reply != null,
      reply: reply ? { content: reply.content, createdAt: reply.created_at } : null,
      createdAt: r.created_at,
    };
  });

  return NextResponse.json({ inquiries, totalCount: count ?? 0 });
}

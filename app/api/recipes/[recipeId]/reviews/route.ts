import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/serverAuth';

const RECIPE_REVIEW_POINT = 10;

export async function GET(req: NextRequest, { params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId: recipeIdStr } = await params;
  const recipeId = parseInt(recipeIdStr);
  if (isNaN(recipeId)) return NextResponse.json({ error: '잘못된 recipeId' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '10')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('reviews')
    .select(
      `review_id, rating, content, created_at,
       users(nickname, profile_image),
       review_images(url)`,
      { count: 'exact' },
    )
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[GET /api/recipes/:id/reviews]', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawRow = {
    review_id: number;
    rating: number;
    content: string;
    created_at: string;
    users: { nickname: string; profile_image: string | null } | null;
    review_images: { url: string }[];
  };

  const reviews = ((data ?? []) as unknown as RawRow[]).map((r) => ({
    reviewId: r.review_id,
    rating: r.rating,
    content: r.content,
    createdAt: r.created_at,
    nickname: r.users?.nickname ?? '(알 수 없음)',
    profileImage: r.users?.profile_image ?? null,
    images: (r.review_images ?? []).map((img) => img.url),
  }));

  return NextResponse.json({ reviews, totalCount: count ?? 0 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId: recipeIdStr } = await params;
  const recipeId = parseInt(recipeIdStr);
  if (isNaN(recipeId)) return NextResponse.json({ error: '잘못된 recipeId' }, { status: 400 });

  const body = await req.json();
  const rating = Number(body.rating);
  const content = String(body.content ?? '').trim();
  const images: string[] = Array.isArray(body.images) ? body.images : [];

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: '평점은 1~5 정수여야 합니다' }, { status: 400 });
  if (!content) return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('reviews')
    .insert({ recipe_id: recipeId, user_id: authed.userId, rating, content })
    .select('review_id')
    .single();

  if (insertError) {
    if (insertError.code === '23505')
      return NextResponse.json({ error: '이미 리뷰를 작성했습니다' }, { status: 409 });
    console.error('[POST /api/recipes/:id/reviews] insert', JSON.stringify(insertError));
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (images.length > 0) {
    await supabaseAdmin
      .from('review_images')
      .insert(images.map((url) => ({ review_id: inserted.review_id, url })));
  }

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('point')
    .eq('user_id', authed.userId)
    .single();

  const [histResult, pointResult] = await Promise.all([
    supabaseAdmin.from('point_history').insert({
      user_id: authed.userId,
      type: '적립',
      amount: RECIPE_REVIEW_POINT,
      description: '레시피 리뷰 작성',
    }),
    supabaseAdmin
      .from('users')
      .update({ point: (userData?.point ?? 0) + RECIPE_REVIEW_POINT })
      .eq('user_id', authed.userId),
  ]);

  if (histResult.error || pointResult.error) {
    console.error('[POST /api/recipes/:id/reviews] point award failed', {
      history: histResult.error,
      balance: pointResult.error,
    });
  }

  return NextResponse.json({ reviewId: inserted.review_id }, { status: 201 });
}

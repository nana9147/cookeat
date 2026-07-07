import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/serverAuth';

const RECIPE_REVIEW_POINT = 10;

type Params = { params: Promise<{ recipeId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { recipeId: raw } = await params;
  const recipeId = parseInt(raw);
  if (isNaN(recipeId))
    return NextResponse.json({ error: '잘못된 recipeId' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(
    1,
    Math.min(50, parseInt(searchParams.get('limit') ?? '10')),
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ data, error, count }, { data: ratingRows }] = await Promise.all([
    supabaseAdmin
      .from('reviews')
      .select(
        'review_id, rating, content, created_at, user_id, review_images(url)',
        { count: 'exact' },
      )
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
      .range(from, to),
    supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('recipe_id', recipeId),
  ]);

  if (error) {
    console.error('[GET /recipes/:id/reviews]', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawRow = {
    review_id: number;
    rating: number;
    content: string;
    created_at: string;
    user_id: number;
    review_images: { url: string }[];
  };

  const rows = (data ?? []) as unknown as RawRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];

  const { data: usersData, error: usersError } = userIds.length
    ? await supabaseAdmin
        .from('users')
        .select('user_id, nickname, email, profile_image, auth_id')
        .in('user_id', userIds)
    : { data: [], error: null };

  if (usersError) {
    console.error('[GET /recipes/:id/reviews] users query', JSON.stringify(usersError));
  }

  type UserRow = {
    user_id: number;
    nickname: string | null;
    email: string;
    profile_image: string | null;
    auth_id: string | null;
  };
  const userMap = new Map(
    (usersData as UserRow[] ?? []).map((u) => [u.user_id, u]),
  );

  const reviews = rows.map((r) => {
    const u = userMap.get(r.user_id);
    return {
      reviewId: r.review_id,
      userId: r.user_id,
      authId: u?.auth_id ?? '',
      rating: r.rating,
      content: r.content,
      createdAt: r.created_at,
      nickname: u?.nickname ?? u?.email?.split('@')[0] ?? '(알 수 없음)',
      profileImage: u?.profile_image ?? null,
      images: (r.review_images ?? []).map((img) => img.url),
    };
  });

  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> =
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  for (const r of ratingRows ?? []) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) { breakdown[star]++; ratingSum += r.rating; }
  }
  const totalCount = count ?? 0;
  const allCount = ratingRows?.length ?? 0;
  const averageRating =
    allCount > 0
      ? Math.round((ratingSum / allCount) * 10) / 10
      : 0;

  return NextResponse.json({
    reviews,
    totalCount,
    averageRating,
    ratingBreakdown: breakdown,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId: raw } = await params;
  const recipeId = parseInt(raw);
  if (isNaN(recipeId))
    return NextResponse.json({ error: '잘못된 recipeId' }, { status: 400 });

  const body = await req.json();
  const rating = Number(body.rating);
  const content = String(body.content ?? '').trim();
  const rawImages: unknown[] = Array.isArray(body.images) ? body.images : [];
  const storageBase =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json(
      { error: '평점은 1~5 정수여야 합니다' },
      { status: 400 },
    );
  if (!content)
    return NextResponse.json(
      { error: '리뷰 내용을 입력해주세요' },
      { status: 400 },
    );
  if (rawImages.length > 5)
    return NextResponse.json(
      { error: '이미지는 최대 5개까지 첨부할 수 있습니다' },
      { status: 400 },
    );
  if (!rawImages.every((u) => typeof u === 'string' && u.startsWith(storageBase)))
    return NextResponse.json(
      { error: '유효하지 않은 이미지 URL입니다' },
      { status: 400 },
    );

  const images = rawImages as string[];

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('reviews')
    .insert({ recipe_id: recipeId, user_id: authed.userId, rating, content })
    .select('review_id')
    .single();

  if (insertError) {
    if (insertError.code === '23505')
      return NextResponse.json(
        { error: '이미 리뷰를 작성했습니다' },
        { status: 409 },
      );
    console.error(
      '[POST /recipes/:id/reviews] insert',
      JSON.stringify(insertError),
    );
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (images.length > 0) {
    await supabaseAdmin
      .from('review_images')
      .insert(images.map((url) => ({ review_id: inserted.review_id, url })));
  }

  const { error: pointError } = await supabaseAdmin.rpc('award_review_point', {
    p_user_id: authed.userId,
    p_amount: RECIPE_REVIEW_POINT,
    p_description: '레시피 리뷰 작성',
  });

  if (pointError) {
    console.error('[POST /recipes/:id/reviews] point award failed', pointError);
  }

  return NextResponse.json({ reviewId: inserted.review_id }, { status: 201 });
}

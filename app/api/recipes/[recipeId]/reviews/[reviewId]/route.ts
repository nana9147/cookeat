import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/serverAuth';

type Params = { params: Promise<{ recipeId: string; reviewId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId: recipeIdStr, reviewId: reviewIdStr } = await params;
  const recipeId = parseInt(recipeIdStr);
  const reviewId = parseInt(reviewIdStr);
  if (isNaN(recipeId) || isNaN(reviewId))
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('review_id, user_id')
    .eq('review_id', reviewId)
    .eq('recipe_id', recipeId)
    .single();

  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 });
  if (existing.user_id !== authed.userId)
    return NextResponse.json({ error: '본인 리뷰만 수정할 수 있습니다' }, { status: 403 });

  const body = await req.json();
  const rating = Number(body.rating);
  const content = String(body.content ?? '').trim();
  const rawImages: unknown[] = Array.isArray(body.images) ? body.images : [];
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: '평점은 1~5 정수여야 합니다' }, { status: 400 });
  if (!content) return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });
  if (rawImages.length > 5)
    return NextResponse.json({ error: '이미지는 최대 5개까지 첨부할 수 있습니다' }, { status: 400 });
  if (rawImages.length > 0 && !rawImages.every((u) => typeof u === 'string' && u.startsWith(storageBase)))
    return NextResponse.json({ error: '유효하지 않은 이미지 URL입니다' }, { status: 400 });

  const images = rawImages as string[];

  const { error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({ rating, content })
    .eq('review_id', reviewId);

  if (updateError) {
    console.error('[PATCH /api/recipes/:id/reviews/:reviewId]', JSON.stringify(updateError));
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from('review_images').delete().eq('review_id', reviewId);
  if (images.length > 0) {
    await supabaseAdmin
      .from('review_images')
      .insert(images.map((url) => ({ review_id: reviewId, url })));
  }

  return NextResponse.json({ reviewId });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId: recipeIdStr, reviewId: reviewIdStr } = await params;
  const recipeId = parseInt(recipeIdStr);
  const reviewId = parseInt(reviewIdStr);
  if (isNaN(recipeId) || isNaN(reviewId))
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('review_id, user_id')
    .eq('review_id', reviewId)
    .eq('recipe_id', recipeId)
    .single();

  if (!existing) return NextResponse.json({ error: '리뷰를 찾을 수 없습니다' }, { status: 404 });
  if (existing.user_id !== authed.userId)
    return NextResponse.json({ error: '본인 리뷰만 삭제할 수 있습니다' }, { status: 403 });

  const { error: deleteError } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('review_id', reviewId);

  if (deleteError) {
    console.error('[DELETE /api/recipes/:id/reviews/:reviewId]', JSON.stringify(deleteError));
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

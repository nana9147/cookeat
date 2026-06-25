import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/serverAuth';

const PRODUCT_REVIEW_POINT = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId: productIdStr } = await params;
  const productId = parseInt(productIdStr);
  if (isNaN(productId)) return NextResponse.json({ error: '잘못된 productId' }, { status: 400 });

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
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[GET /api/products/:id/reviews]', JSON.stringify(error));
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
  { params }: { params: Promise<{ productId: string }> },
) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { productId: productIdStr } = await params;
  const productId = parseInt(productIdStr);
  if (isNaN(productId)) return NextResponse.json({ error: '잘못된 productId' }, { status: 400 });

  const body = await req.json();
  const orderItemId = Number(body.orderItemId);
  const rating = Number(body.rating);
  const content = String(body.content ?? '').trim();
  const images: string[] = Array.isArray(body.images) ? body.images : [];

  if (!Number.isInteger(orderItemId) || orderItemId <= 0)
    return NextResponse.json({ error: 'orderItemId가 필요합니다' }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: '평점은 1~5 정수여야 합니다' }, { status: 400 });
  if (!content) return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });

  // 구매 확인 및 포인트 계산 기준 조회
  const { data: orderItem, error: itemError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, product_id, quantity, unit_price, orders!inner(user_id)')
    .eq('item_id', orderItemId)
    .eq('product_id', productId)
    .single();

  if (itemError || !orderItem)
    return NextResponse.json({ error: '해당 주문 상품을 찾을 수 없습니다' }, { status: 404 });

  type RawOrderItem = {
    item_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    orders: { user_id: number } | { user_id: number }[];
  };
  const raw = orderItem as unknown as RawOrderItem;
  const orderUserId = Array.isArray(raw.orders) ? raw.orders[0]?.user_id : raw.orders?.user_id;

  if (orderUserId !== authed.userId)
    return NextResponse.json({ error: '본인 주문에만 리뷰를 작성할 수 있습니다' }, { status: 403 });

  const pointAmount = PRODUCT_REVIEW_POINT;

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id: productId,
      order_item_id: orderItemId,
      user_id: authed.userId,
      rating,
      content,
    })
    .select('review_id')
    .single();

  if (insertError) {
    if (insertError.code === '23505')
      return NextResponse.json({ error: '이미 리뷰를 작성했습니다' }, { status: 409 });
    console.error('[POST /api/products/:id/reviews] insert', JSON.stringify(insertError));
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
      amount: pointAmount,
      description: '상품 리뷰 작성',
    }),
    supabaseAdmin
      .from('users')
      .update({ point: (userData?.point ?? 0) + pointAmount })
      .eq('user_id', authed.userId),
  ]);

  if (histResult.error || pointResult.error) {
    console.error('[POST /api/products/:id/reviews] point award failed', {
      history: histResult.error,
      balance: pointResult.error,
    });
  }

  return NextResponse.json({ reviewId: inserted.review_id, pointAwarded: pointAmount }, { status: 201 });
}

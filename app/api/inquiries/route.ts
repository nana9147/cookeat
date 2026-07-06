import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { GENERAL_CATEGORIES, SELLER_CATEGORIES, VALID_CATEGORIES } from '@/lib/inquiryCategories';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select(`inquiry_id, category, title, created_at, product_id, order_item_id, inquiry_replies(reply_id)`)
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type ReplyRow = { reply_id: number };
  type Row = {
    inquiry_id: number;
    category: string;
    title: string;
    created_at: string;
    product_id: number | null;
    order_item_id: number | null;
    inquiry_replies: ReplyRow[] | ReplyRow | null;
  };

  const inquiries = ((data as unknown as Row[]) ?? []).map((r) => {
    const raw = r.inquiry_replies;
    const isAnswered = raw !== null && raw !== undefined && (Array.isArray(raw) ? raw.length > 0 : true);
    const target = r.product_id != null || r.order_item_id != null ? 'seller' : 'admin';
    return { inquiryId: r.inquiry_id, category: r.category, title: r.title, isAnswered, createdAt: r.created_at, target };
  });

  return NextResponse.json({ inquiries });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { category, title, content, productId, orderItemId, images } = body as {
    category: string;
    title: string;
    content: string;
    productId?: number;
    orderItemId?: number;
    images?: unknown;
  };

  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
  }
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }

  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;
  const rawImages: unknown[] = Array.isArray(images) ? images : [];
  if (rawImages.length > 5) {
    return NextResponse.json({ error: '이미지는 최대 5개까지 첨부할 수 있습니다.' }, { status: 400 });
  }
  if (!rawImages.every((u) => typeof u === 'string' && u.startsWith(storageBase))) {
    return NextResponse.json({ error: '유효하지 않은 이미지 URL입니다.' }, { status: 400 });
  }
  const imageUrls = rawImages as string[];

  if (productId != null && orderItemId != null) {
    return NextResponse.json({ error: '상품과 주문 상품을 동시에 지정할 수 없습니다.' }, { status: 400 });
  }

  let linkedProductId: number | null = null;
  let linkedOrderItemId: number | null = null;

  if (productId != null) {
    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json({ error: '문의할 상품을 선택해주세요.' }, { status: 400 });
    }
    if (!(SELLER_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
    }
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('product_id')
      .eq('product_id', productId)
      .single();
    if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    linkedProductId = productId;
  } else if (orderItemId != null) {
    if (!Number.isInteger(orderItemId) || orderItemId < 1) {
      return NextResponse.json({ error: '문의할 주문 상품을 선택해주세요.' }, { status: 400 });
    }
    if (!(SELLER_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
    }
    const { data: item } = await supabaseAdmin
      .from('order_items')
      .select('item_id, orders!inner(user_id)')
      .eq('item_id', orderItemId)
      .single();
    const orderUserId = (item?.orders as unknown as { user_id: number } | null)?.user_id;
    if (!item || orderUserId !== authed.userId) {
      return NextResponse.json({ error: '주문 상품을 찾을 수 없습니다.' }, { status: 404 });
    }
    linkedOrderItemId = orderItemId;
  } else {
    if (!(GENERAL_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 문의 유형입니다.' }, { status: 400 });
    }
    if (rawImages.length > 0) {
      return NextResponse.json({ error: '일반 문의에는 사진을 첨부할 수 없습니다.' }, { status: 400 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      user_id: authed.userId,
      category,
      title: title.trim(),
      content: content.trim(),
      product_id: linkedProductId,
      order_item_id: linkedOrderItemId,
    })
    .select('inquiry_id, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (imageUrls.length > 0) {
    await supabaseAdmin
      .from('inquiry_images')
      .insert(imageUrls.map((url) => ({ inquiry_id: data.inquiry_id, url })));
  }

  return NextResponse.json(
    { inquiryId: data.inquiry_id, isAnswered: false, createdAt: data.created_at },
    { status: 201 }
  );
}

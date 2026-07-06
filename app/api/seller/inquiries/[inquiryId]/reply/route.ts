import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext, type SellerContext } from '@/lib/sellerContext';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type OwnershipCheck = { ok: true; inquiryId: number } | { ok: false; response: NextResponse };

async function verifyOwnership(id: number, sellerCtx: SellerContext): Promise<OwnershipCheck> {
  const { data: inquiry, error } = await supabaseAdmin
    .from('inquiries')
    .select('inquiry_id, product_id, order_item_id, products(seller_id), order_items(seller_id)')
    .eq('inquiry_id', id)
    .maybeSingle();

  if (error)
    return { ok: false, response: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!inquiry) {
    return {
      ok: false,
      response: NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 }),
    };
  }

  const productSellerId = (inquiry.products as unknown as { seller_id: number } | null)?.seller_id;
  const orderItemSellerId = (inquiry.order_items as unknown as { seller_id: number } | null)
    ?.seller_id;

  const isOwner =
    (inquiry.product_id != null && productSellerId === sellerCtx.sellerId) ||
    (inquiry.order_item_id != null && orderItemSellerId === sellerCtx.sellerId);

  if (!isOwner) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '본인 판매 상품/주문에 대한 문의만 처리할 수 있습니다.' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, inquiryId: id };
}

function parseId(inquiryId: string) {
  const id = Number(inquiryId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inquiryId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;
  if (sellerCtx.role === 'admin') {
    return NextResponse.json({ error: '관리자는 조회만 가능합니다.' }, { status: 403 });
  }

  const { inquiryId } = await params;
  const id = parseId(inquiryId);
  if (!id) return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim() ?? '';
  if (!content) return NextResponse.json({ error: '답변 내용을 입력해 주세요.' }, { status: 400 });

  const ownership = await verifyOwnership(id, sellerCtx);
  if (!ownership.ok) return ownership.response;

  const { data: existing, error: checkError } = await supabaseAdmin
    .from('inquiry_replies')
    .select('reply_id')
    .eq('inquiry_id', id)
    .maybeSingle();

  if (checkError) return NextResponse.json({ error: checkError.message }, { status: 500 });
  if (existing) return NextResponse.json({ error: '이미 답변된 문의입니다.' }, { status: 409 });

  const { error } = await supabaseAdmin.from('inquiry_replies').insert({
    inquiry_id: id,
    seller_id: sellerCtx.sellerId,
    content,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ inquiryId: string }> }
) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;
  if (sellerCtx.role === 'admin') {
    return NextResponse.json({ error: '관리자는 조회만 가능합니다.' }, { status: 403 });
  }

  const { inquiryId } = await params;
  const id = parseId(inquiryId);
  if (!id) return NextResponse.json({ error: '유효하지 않은 문의 ID입니다.' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const content = body?.content?.trim() ?? '';
  if (!content) return NextResponse.json({ error: '답변 내용을 입력해 주세요.' }, { status: 400 });

  const ownership = await verifyOwnership(id, sellerCtx);
  if (!ownership.ok) return ownership.response;

  const { data: existing, error: checkError } = await supabaseAdmin
    .from('inquiry_replies')
    .select('reply_id, seller_id')
    .eq('inquiry_id', id)
    .maybeSingle();

  if (checkError) return NextResponse.json({ error: checkError.message }, { status: 500 });
  if (!existing) {
    return NextResponse.json({ error: '아직 등록된 답변이 없습니다.' }, { status: 404 });
  }

  if (existing.seller_id !== sellerCtx.sellerId) {
    return NextResponse.json(
      { error: '본인이 작성한 답변만 수정할 수 있습니다.' },
      { status: 403 }
    );
  }

  const { error } = await supabaseAdmin
    .from('inquiry_replies')
    .update({ content })
    .eq('reply_id', existing.reply_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const status = searchParams.get('status') ?? '';
  const limit = 10;
  const offset = (page - 1) * limit;

  const VALID_STATUSES = ['결제완료', '주문확인', '배송준비', '배송중', '배송완료', '취소'];

  let query = supabaseAdmin
    .from('orders')
    .select(
      `order_id, final_amount, total_amount, shipping_fee, status, payment_method, created_at,
       order_items(item_id, quantity, unit_price, products(name, image))`,
      { count: 'exact' }
    )
    .eq('user_id', authed.userId)
    .neq('status', '결제전')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status === '배송중') {
    // 탭 '배송중'은 UX상 '배송준비' 포함 — 사용자 관점에서 같은 진행 단계
    query = query.in('status', ['배송준비', '배송중']);
  } else if (status && VALID_STATUSES.includes(status)) {
    query = query.eq('status', status);
  } else if (status) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
  }

  type OrderItemNested = {
    item_id: number;
    quantity: number;
    unit_price: number;
    products: { name: string; image: string | null } | null;
  };

  type OrderRow = {
    order_id: string;
    final_amount: number;
    total_amount: number;
    shipping_fee: number;
    status: string;
    payment_method: string;
    created_at: string;
    order_items: OrderItemNested[] | null;
  };

  const { data: rawOrders, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = ((rawOrders as unknown as OrderRow[]) ?? []).map((o) => {
    const items = o.order_items ?? [];
    return {
      orderId: o.order_id,
      finalAmount: o.final_amount,
      totalAmount: o.total_amount,
      shippingFee: o.shipping_fee,
      status: o.status,
      paymentMethod: o.payment_method,
      createdAt: o.created_at,
      itemCount: items.length,
      previewItems: items.slice(0, 3).map((i) => ({
        itemId: i.item_id,
        name: i.products?.name ?? '',
        image: i.products?.image ?? null,
        quantity: i.quantity,
        unitPrice: i.unit_price,
      })),
    };
  });

  return NextResponse.json({
    orders: mapped,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      hasNext: offset + limit < (count ?? 0),
    },
  });
}

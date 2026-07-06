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

  const VALID_STATUSES = ['결제완료', '주문확인', '배송준비', '배송중', '배송완료', '취소', '환불'];

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

  // 판매자 승인 전(취소요청/환불요청 접수 상태)인 주문 ID — 각 탭에는 포함시키고, 그 외 탭에서는 제외한다
  const { data: pendingRows, error: pendingRowsError } = await supabaseAdmin
    .from('refund_requests')
    .select('status, order_items!inner(order_id, orders!inner(user_id))')
    .in('status', ['취소요청', '환불요청'])
    .is('reject_reason', null)
    .eq('order_items.orders.user_id', authed.userId);

  if (pendingRowsError) return NextResponse.json({ error: pendingRowsError.message }, { status: 500 });

  const pendingCancelOrderIds = [
    ...new Set(
      (pendingRows ?? [])
        .filter((r) => r.status === '취소요청')
        .map((r) => (r.order_items as unknown as { order_id: string }).order_id)
    ),
  ];
  const pendingRefundOrderIds = [
    ...new Set(
      (pendingRows ?? [])
        .filter((r) => r.status === '환불요청')
        .map((r) => (r.order_items as unknown as { order_id: string }).order_id)
    ),
  ];

  if (status === '배송중') {
    // 탭 '배송중'은 UX상 '배송준비' 포함 — 사용자 관점에서 같은 진행 단계
    query = query.in('status', ['배송준비', '배송중']);
  } else if (status === '취소') {
    query = pendingCancelOrderIds.length > 0
      ? query.or(`status.eq.취소,order_id.in.(${pendingCancelOrderIds.join(',')})`)
      : query.eq('status', '취소');
  } else if (status === '환불') {
    query = pendingRefundOrderIds.length > 0
      ? query.or(`status.eq.환불,order_id.in.(${pendingRefundOrderIds.join(',')})`)
      : query.eq('status', '환불');
  } else if (status && VALID_STATUSES.includes(status)) {
    query = query.eq('status', status);
  } else if (status) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
  }

  // 취소/환불 탭이 아니면 해당 신청 접수된 주문은 주문/배송내역에서 숨긴다
  if (status !== '취소' && pendingCancelOrderIds.length > 0) {
    query = query.not('order_id', 'in', `(${pendingCancelOrderIds.join(',')})`);
  }
  if (status !== '환불' && pendingRefundOrderIds.length > 0) {
    query = query.not('order_id', 'in', `(${pendingRefundOrderIds.join(',')})`);
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

  const orderRows = (rawOrders as unknown as OrderRow[]) ?? [];
  const allItemIds = orderRows.flatMap((o) => (o.order_items ?? []).map((i) => i.item_id));

  const pendingCancelItemIds = new Set<number>();
  const pendingRefundItemIds = new Set<number>();
  if (allItemIds.length > 0) {
    const { data: pendingRefunds, error: pendingError } = await supabaseAdmin
      .from('refund_requests')
      .select('item_id, status')
      .in('item_id', allItemIds)
      .in('status', ['취소요청', '환불요청'])
      .is('reject_reason', null);

    if (pendingError) return NextResponse.json({ error: pendingError.message }, { status: 500 });
    for (const r of pendingRefunds ?? []) {
      if (r.status === '취소요청') pendingCancelItemIds.add(r.item_id);
      else pendingRefundItemIds.add(r.item_id);
    }
  }

  const mapped = orderRows.map((o) => {
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
      hasPendingCancelRequest: items.some((i) => pendingCancelItemIds.has(i.item_id)),
      hasPendingRefundRequest: items.some((i) => pendingRefundItemIds.has(i.item_id)),
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

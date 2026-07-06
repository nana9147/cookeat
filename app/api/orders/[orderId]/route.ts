import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { orderId } = await params;

  const [orderRes, shippingsRes] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select(
        `order_id, total_amount, shipping_fee, used_point, coupon_discount, final_amount,
         payment_method, status, recipient, phone, address, address_detail, shipping_request, created_at,
         order_items(item_id, product_id, quantity, unit_price, products(name, image))`
      )
      .eq('order_id', orderId)
      .eq('user_id', authed.userId)
      .single(),
    supabaseAdmin
      .from('shippings')
      .select('carrier, tracking_number, shipped_at, delivered_at')
      .eq('order_id', orderId),
  ]);

  if (orderRes.error || !orderRes.data) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  type Item = {
    item_id: number; product_id: number; quantity: number; unit_price: number;
    products: { name: string; image: string | null } | null;
  };
  type Row = {
    order_id: string; total_amount: number; shipping_fee: number; used_point: number | null;
    coupon_discount: number | null; final_amount: number; payment_method: string; status: string;
    recipient: string; phone: string; address: string; address_detail: string | null;
    shipping_request: string | null; created_at: string;
    order_items: Item[] | null;
  };
  const r = orderRes.data as unknown as Row;
  const shippings = shippingsRes.data ?? [];

  const itemIds = (r.order_items ?? []).map((i) => i.item_id);
  let hasPendingCancelRequest = false;
  let hasPendingRefundRequest = false;
  const claimByItemId = new Map<
    number,
    { status: string; requestReason: string | null; rejectReason: string | null }
  >();
  if (itemIds.length > 0) {
    // 아이템별 최근 취소/환불 신청 이력 — 신청 사유·거부 사유를 주문상세에 노출하기 위함
    const { data: claims } = await supabaseAdmin
      .from('refund_requests')
      .select('item_id, status, request_reason, reject_reason, requested_at')
      .in('item_id', itemIds)
      .order('requested_at', { ascending: false });

    for (const c of claims ?? []) {
      if (!claimByItemId.has(c.item_id)) {
        claimByItemId.set(c.item_id, {
          status: c.status,
          requestReason: c.request_reason,
          rejectReason: c.reject_reason,
        });
      }
    }
    hasPendingCancelRequest = [...claimByItemId.values()].some((c) => c.status === '취소요청');
    hasPendingRefundRequest = [...claimByItemId.values()].some((c) => c.status === '환불요청');
  }

  return NextResponse.json({
    orderId: r.order_id,
    status: r.status,
    hasPendingCancelRequest,
    hasPendingRefundRequest,
    createdAt: r.created_at,
    totalAmount: r.total_amount,
    shippingFee: r.shipping_fee,
    usedPoint: r.used_point ?? 0,
    couponDiscount: r.coupon_discount ?? 0,
    finalAmount: r.final_amount,
    paymentMethod: r.payment_method,
    shipping: {
      recipient: r.recipient,
      phone: r.phone,
      address: r.address,
      addressDetail: r.address_detail ?? null,
      request: r.shipping_request ?? null,
    },
    items: (r.order_items ?? []).map((i) => {
      const claim = claimByItemId.get(i.item_id);
      return {
        itemId: i.item_id,
        productId: i.product_id,
        name: i.products?.name ?? '',
        image: i.products?.image ?? null,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        claim: claim
          ? {
              status: claim.status,
              requestReason: claim.requestReason,
              rejectReason: claim.rejectReason,
            }
          : null,
      };
    }),
    trackings: shippings.map((s) => ({
      carrier: s.carrier,
      trackingNumber: s.tracking_number,
      shippedAt: s.shipped_at,
      deliveredAt: s.delivered_at,
    })),
  });
}

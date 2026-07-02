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

  return NextResponse.json({
    orderId: r.order_id,
    status: r.status,
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
    items: (r.order_items ?? []).map((i) => ({
      itemId: i.item_id,
      productId: i.product_id,
      name: i.products?.name ?? '',
      image: i.products?.image ?? null,
      quantity: i.quantity,
      unitPrice: i.unit_price,
    })),
    trackings: shippings.map((s) => ({
      carrier: s.carrier,
      trackingNumber: s.tracking_number,
      shippedAt: s.shipped_at,
      deliveredAt: s.delivered_at,
    })),
  });
}

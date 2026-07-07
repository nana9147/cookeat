import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type OrderItemRow = {
  item_id: number;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
    image: string | null;
    sellers: { store_name: string } | null;
  } | null;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { orderId } = await params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('order_id, total_amount, shipping_fee, used_point, coupon_discount, final_amount, payment_method, recipient, phone, address, created_at')
    .eq('order_id', orderId)
    .eq('user_id', authed.userId)
    .single() as { data: { order_id: string; total_amount: number; shipping_fee: number; used_point: number; coupon_discount: number; final_amount: number; payment_method: string; recipient: string; phone: string; address: string; created_at: string } | null; error: unknown };

  if (orderError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  const { data: rawItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, quantity, unit_price, products(name, image, sellers(store_name))')
    .eq('order_id', orderId);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const items = (rawItems ?? []) as unknown as OrderItemRow[];

  return NextResponse.json({
    orderId: order.order_id,
    totalAmount: order.total_amount,
    shippingFee: order.shipping_fee,
    usedPoint: order.used_point ?? 0,
    couponDiscount: order.coupon_discount ?? 0,
    finalAmount: order.final_amount,
    paymentMethod: order.payment_method,
    recipient: order.recipient,
    phone: order.phone,
    address: order.address,
    createdAt: order.created_at,
    items: items.map((i) => ({
      itemId: i.item_id,
      name: i.products?.name ?? '',
      image: i.products?.image ?? null,
      seller: i.products?.sellers?.store_name ?? '',
      quantity: i.quantity,
      unitPrice: i.unit_price,
    })),
  });
}

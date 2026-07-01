import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['결제전', '결제완료', '주문확인', '배송준비', '배송중', '배송완료', '구매확정', '취소', '환불'] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('orders')
    .select(
      `order_id, user_id, total_amount, shipping_fee, used_point, coupon_id, coupon_discount,
       final_amount, payment_method, status, recipient, phone, address, address_detail,
       shipping_request, created_at, updated_at,
       order_items(item_id, product_id, seller_id, quantity, unit_price,
         products(name))`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status && VALID_STATUSES.includes(status as OrderStatus)) {
    query = query.eq('status', status);
  }

  if (keyword) {
    query = query.or(`order_id.ilike.%${keyword}%,recipient.ilike.%${keyword}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /admin/orders] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type RawItem = {
    item_id: number;
    product_id: number;
    seller_id: number;
    quantity: number;
    unit_price: number;
    products: { name: string } | null;
  };

  const orders = (data ?? []).map((o) => {
    const items = (o.order_items as unknown as RawItem[]) ?? [];
    return {
      orderId: o.order_id,
      userId: o.user_id,
      totalAmount: o.total_amount,
      shippingFee: o.shipping_fee,
      usedPoint: o.used_point,
      couponId: o.coupon_id,
      couponDiscount: o.coupon_discount,
      finalAmount: o.final_amount,
      paymentMethod: o.payment_method,
      status: o.status as OrderStatus,
      recipient: o.recipient,
      phone: o.phone,
      address: o.address,
      addressDetail: o.address_detail,
      shippingRequest: o.shipping_request,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      orderItems: items.map((item) => ({
        itemId: item.item_id,
        orderId: o.order_id,
        productId: item.product_id,
        productName: item.products?.name ?? '(삭제된 상품)',
        sellerId: item.seller_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    };
  });

  return NextResponse.json({
    orders,
    pagination: { page, limit, total: count ?? 0, hasNext: to < (count ?? 0) - 1 },
  });
}

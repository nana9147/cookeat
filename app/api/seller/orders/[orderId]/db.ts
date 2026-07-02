import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { OrderStatus } from '@/types/seller/order';

export async function getSellerOrderDetail(sellerId: number, orderId: string) {
  const { data: sellerItems, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, quantity, unit_price, shipping_status, products(name, image)')
    .eq('order_id', orderId)
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  if (!sellerItems || sellerItems.length === 0) {
    throw new Error('주문을 찾을 수 없습니다.');
  }

  const itemIds = sellerItems.map((i) => i.item_id);
  const { data: refunds, error: refundsError } = await supabaseAdmin
    .from('refund_requests')
    .select('item_id, status, request_reason, reject_reason')
    .in('item_id', itemIds)
    .order('requested_at', { ascending: false });

  if (refundsError) throw refundsError;

  const latestRefundByItem = new Map<
    number,
    { status: string; requestReason: string | null; rejectReason: string | null }
  >();
  for (const r of refunds ?? []) {
    if (!latestRefundByItem.has(r.item_id)) {
      latestRefundByItem.set(r.item_id, {
        status: r.status,
        requestReason: r.request_reason,
        rejectReason: r.reject_reason,
      });
    }
  }

  const { data: shipping, error: shippingError } = await supabaseAdmin
    .from('shippings')
    .select('shipping_fee')
    .eq('order_id', orderId)
    .eq('seller_id', sellerId)
    .limit(1)
    .maybeSingle();

  if (shippingError) throw shippingError;

  const { data: allItems, error: allItemsError } = await supabaseAdmin
    .from('order_items')
    .select('quantity, unit_price')
    .eq('order_id', orderId);

  if (allItemsError) throw allItemsError;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(
      'order_id, created_at, status, recipient, phone, address, address_detail, shipping_request, user_coupon_id, coupon_discount, used_point, payment_method, user_coupons(coupons(code, discount_type, discount_value))'
    )
    .eq('order_id', orderId)
    .single();

  if (orderError) throw orderError;

  const products = sellerItems.map((item) => {
    const product = item.products as unknown as { name: string; image: string } | null;
    const refund = latestRefundByItem.get(item.item_id);

    const isPendingClaim =
      refund &&
      !refund.rejectReason &&
      (refund.status === '환불요청' || refund.status === '취소요청');

    return {
      id: String(item.item_id),
      itemName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      itemTotalPrice: item.quantity * item.unit_price,
      img: product?.image ?? '',
      itemStatus: isPendingClaim
        ? (refund!.status as OrderStatus)
        : (item.shipping_status as OrderStatus | null),
      refundRequestReason: refund?.requestReason ?? null,
      refundRejectReason: refund?.rejectReason ?? null,
    };
  });

  const sellerTotalPrice = products.reduce((sum, p) => sum + p.itemTotalPrice, 0);
  const orderTotalPrice = (allItems ?? []).reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const sellerRatio = orderTotalPrice > 0 ? sellerTotalPrice / orderTotalPrice : 0;

  const allocatedCouponDiscount = Math.round((order.coupon_discount ?? 0) * sellerRatio);
  const allocatedPointAmount = Math.round((order.used_point ?? 0) * sellerRatio);

  const sellerTotalDiscount = allocatedCouponDiscount + allocatedPointAmount;
  const productsWithNet = products.map((p) => {
    const itemDiscountShare =
      sellerTotalPrice > 0
        ? Math.round((p.itemTotalPrice / sellerTotalPrice) * sellerTotalDiscount)
        : 0;
    return {
      ...p,
      itemNetAmount: p.itemTotalPrice - itemDiscountShare,
    };
  });

  const shippingFee = shipping?.shipping_fee ?? 0;

  const CLAIM_STATUSES = ['환불요청', '환불진행중', '환불', '취소요청', '취소'];
  const refundedPointAmount = productsWithNet.reduce((sum, p) => {
    if (!p.itemStatus || !CLAIM_STATUSES.includes(p.itemStatus)) return sum;
    const share =
      orderTotalPrice > 0
        ? Math.round((p.itemTotalPrice / orderTotalPrice) * (order.used_point ?? 0))
        : 0;
    return sum + share;
  }, 0);

  const couponRestored =
    Boolean(order.user_coupon_id) && (order.status === '취소' || order.status === '환불');

  const userCoupon = order.user_coupons as unknown as {
    coupons: { code: string; discount_type: 'rate' | 'fixed'; discount_value: number } | null;
  } | null;
  const coupon = userCoupon?.coupons ?? null;

  return {
    info: {
      id: order.order_id,
      orderDate: order.created_at,
      status: order.status,
    },
    products: productsWithNet,
    payment: {
      totalPrice: sellerTotalPrice,
      shippingFee,
      couponCode: coupon?.code ?? null,
      couponDiscountType: coupon?.discount_type ?? null,
      couponDiscountValue: coupon?.discount_value ?? null,
      couponDiscount: allocatedCouponDiscount,
      pointAmount: allocatedPointAmount,
      finalAmount: sellerTotalPrice + shippingFee - allocatedCouponDiscount - allocatedPointAmount,
      paymentMethod: order.payment_method,
      refundedPointAmount,
      couponRestored,
    },
    delivery: {
      name: order.recipient ?? '',
      phone: order.phone ?? '',
      address: order.address ?? '',
      addressDetail: order.address_detail ?? '',
      memo: order.shipping_request ?? '',
    },
  };
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { OrderStatus } from '@/types/seller/order';

export async function getSellerOrderDetail(sellerId: number, orderId: string) {
  const { data: sellerItems, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select(
      'item_id, quantity, unit_price, original_unit_price, shipping_status, allocated_coupon_discount, allocated_point, products(name, image)'
    )
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

    const couponDiscount = item.allocated_coupon_discount ?? 0;
    const itemDiscountAppliedPrice = item.quantity * item.unit_price; // 상품 할인만 적용된 중간 금액

    return {
      id: String(item.item_id),
      itemName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      unitPrice: item.unit_price, // 상품 할인 후 단가
      originalUnitPrice: item.original_unit_price, // 할인 전 원가 단가
      productDiscount: (item.original_unit_price - item.unit_price) * item.quantity, // 총 상품할인액
      couponDiscount, // 총 쿠폰할인액

      itemTotalPrice: itemDiscountAppliedPrice - couponDiscount,

      img: product?.image ?? '',
      itemStatus: isPendingClaim
        ? (refund!.status as OrderStatus)
        : (item.shipping_status as OrderStatus | null),
      refundRequestReason: refund?.requestReason ?? null,
      refundRejectReason: refund?.rejectReason ?? null,
      allocatedPoint: item.allocated_point ?? 0,
    };
  });

  const displayTotalPrice = products.reduce((sum, p) => sum + p.originalUnitPrice * p.quantity, 0);

  // 전체 상품 할인 총합 계산
  const totalProductDiscount = products.reduce((sum, p) => sum + p.productDiscount, 0);

  // 쿠폰/포인트 분배 금액 합산
  const totalAllocatedCouponDiscount = products.reduce((sum, p) => sum + p.couponDiscount, 0);
  const totalAllocatedPointAmount = sellerItems.reduce(
    (sum, item) => sum + (item.allocated_point ?? 0),
    0
  );

  const shippingFee = shipping?.shipping_fee ?? 0;

  const userCoupon = order.user_coupons as unknown as {
    coupons: { code: string; discount_type: 'rate' | 'fixed'; discount_value: number } | null;
  } | null;
  const coupon = userCoupon?.coupons ?? null;

  return {
    info: {
      id: order.order_id,
      orderDate: order.created_at,
      status: order.status,
      paymentMethod: order.payment_method,
    },
    products,
    payment: {
      totalPrice: displayTotalPrice, // 정가 상품금액 총합
      shippingFee,
      couponCode: coupon?.code ?? null,
      couponDiscountType: coupon?.discount_type ?? null,
      couponDiscountValue: coupon?.discount_value ?? null,

      // 실제 차감 내역 매핑
      productDiscount: totalProductDiscount, // 상품할인 총액 항목 노출용
      couponDiscount: totalAllocatedCouponDiscount, // 실제 쿠폰할인액
      pointAmount: totalAllocatedPointAmount, // 실제 포인트사용액

      // 최종 결제 금액 = 정가총합 + 배송비 - 상품할인 - 쿠폰할인 - 포인트
      finalAmount:
        displayTotalPrice +
        shippingFee -
        totalProductDiscount -
        totalAllocatedCouponDiscount -
        totalAllocatedPointAmount,
      paymentMethod: order.payment_method,
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

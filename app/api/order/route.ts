import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcShipping } from '@/lib/shipping';

interface OrderItem {
  productId: number;
  quantity: number;
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  card: '카드',
  kakao: '카카오페이',
  toss: '토스페이',
  bankbook: '무통장입금',
  mobile: '휴대폰결제',
};

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { items, paymentMethod, recipient = '', phone = '', address = '' } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: '주문 상품이 없습니다.' }, { status: 400 });
  }
  if (items.length > 50) {
    return NextResponse.json({ error: '한 번에 주문할 수 있는 상품은 50개까지입니다.' }, { status: 400 });
  }

  const productIds: number[] = items.map((i: OrderItem) => i.productId);
  if (new Set(productIds).size !== productIds.length) {
    return NextResponse.json({ error: '중복된 상품이 포함되어 있습니다.' }, { status: 400 });
  }

  // DB에서 실제 가격·재고·상태 조회
  const { data: products, error: productError } = await supabaseAdmin
    .from('products')
    .select('product_id, price, stock, status, seller_id')
    .in('product_id', productIds);

  if (productError || !products) {
    return NextResponse.json({ error: '상품 정보를 불러올 수 없습니다.' }, { status: 500 });
  }

  // 상품별 검증 및 서버 사이드 금액 계산
  let totalAmount = 0;
  const validatedItems: {
    product_id: number;
    quantity: number;
    unit_price: number;
    seller_id: number;
  }[] = [];

  for (const item of items as OrderItem[]) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      return NextResponse.json({ error: '유효하지 않은 상품 ID입니다.' }, { status: 400 });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
      return NextResponse.json({ error: '수량은 1~1000 사이여야 합니다.' }, { status: 400 });
    }
    const product = products.find((p) => p.product_id === item.productId);
    if (!product) {
      return NextResponse.json({ error: '존재하지 않는 상품이 포함되어 있습니다.' }, { status: 400 });
    }
    if (product.status !== '판매중') {
      return NextResponse.json(
        { error: '판매 중이 아닌 상품이 포함되어 있습니다.' },
        { status: 400 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: '재고가 부족한 상품이 있습니다.' }, { status: 400 });
    }
    totalAmount += product.price * item.quantity;
    validatedItems.push({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: product.price,
      seller_id: product.seller_id,
    });
  }

  const shippingFee = calcShipping(totalAmount);
  const finalAmount = totalAmount + shippingFee;

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  const orderId = `ORD-${datePart}-${randomPart}`;

  // 재고 차감 · orders INSERT · order_items INSERT 를 DB 트랜잭션 하나로 처리
  // 중간 실패 시 DB가 전체를 자동 롤백하므로 보상 코드가 필요 없습니다
  const { error: rpcError } = await supabaseAdmin.rpc('create_order', {
    p_order_id: orderId,
    p_user_id: authed.userId,
    p_items: validatedItems,
    p_total_amount: totalAmount,
    p_shipping_fee: shippingFee,
    p_coupon_discount: 0,
    p_final_amount: finalAmount,
    p_payment_method: PAYMENT_METHOD_MAP[paymentMethod] ?? paymentMethod,
    p_recipient: recipient,
    p_phone: phone,
    p_address: address,
  });

  if (rpcError) {
    // errcode P0001 = 재고 부족으로 함수 내부에서 raise exception
    const isStockError =
      rpcError.code === 'P0001' || (rpcError.message ?? '').includes('재고 부족');
    return NextResponse.json(
      { error: isStockError ? '재고가 부족합니다. 다시 시도해주세요.' : '주문 생성 실패' },
      { status: isStockError ? 409 : 500 }
    );
  }

  return NextResponse.json({ orderId, finalAmount });
}

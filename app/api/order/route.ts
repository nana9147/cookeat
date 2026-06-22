import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcShipping } from '@/lib/shipping';

interface OrderItem {
  productId: number;
  quantity: number;
}

type DecrementedItem = {
  productId: number;
  quantity: number;
  prevStock: number;
};

// 낙관적 잠금 원복 — 동시 변경이 감지되면 그 항목을 건너뛰고 productId 목록을 반환
async function restoreStock(items: DecrementedItem[]): Promise<number[]> {
  const unrestored: number[] = [];
  for (const item of items) {
    const { count, error } = await supabaseAdmin
      .from('products')
      .update({ stock: item.prevStock }, { count: 'exact' })
      .eq('product_id', item.productId)
      .eq('stock', item.prevStock - item.quantity);
    if (error) {
      console.error(`[order] stock restore error product=${item.productId}:`, error.message);
      unrestored.push(item.productId);
    } else if ((count ?? 0) === 0) {
      console.warn(`[order] stock restore skipped (concurrent change) product=${item.productId}`);
      unrestored.push(item.productId);
    }
  }
  return unrestored;
}

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
    productId: number;
    quantity: number;
    unitPrice: number;
    sellerId: number;
    prevStock: number;
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
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      sellerId: product.seller_id,
      prevStock: product.stock,
    });
  }

  const shippingFee = calcShipping(totalAmount);
  const finalAmount = totalAmount + shippingFee;

  // 재고 선차감 — .eq('stock', prevStock) CAS로 동시 주문 충돌 감지
  // 완전한 원자성은 DB 트랜잭션(RPC)이 필요하며, 이 구현은 낙관적 잠금에 근사함
  const decremented: DecrementedItem[] = [];
  for (const item of validatedItems) {
    const { count } = await supabaseAdmin
      .from('products')
      .update({ stock: item.prevStock - item.quantity }, { count: 'exact' })
      .eq('product_id', item.productId)
      .eq('stock', item.prevStock);

    if ((count ?? 0) === 0) {
      // 동시 주문으로 재고 소진 — 이미 차감한 항목 원복
      const unrestored = await restoreStock(decremented);
      if (unrestored.length > 0) {
        console.error(`[order] concurrent stock restore failed for products:`, unrestored);
      }
      return NextResponse.json({ error: '재고가 부족합니다. 다시 시도해주세요.' }, { status: 409 });
    }
    decremented.push({ productId: item.productId, quantity: item.quantity, prevStock: item.prevStock });
  }

  // 재고가 0이 된 상품을 품절로 전환 (숨김 상태는 유지)
  const zeroStockIds = decremented
    .filter((item) => item.prevStock - item.quantity === 0)
    .map((item) => item.productId);
  if (zeroStockIds.length > 0) {
    await supabaseAdmin
      .from('products')
      .update({ status: '품절' })
      .in('product_id', zeroStockIds)
      .eq('status', '판매중');
  }

  const orderId = `ORD-${crypto.randomUUID()}`;

  // orders 생성
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      order_id: orderId,
      user_id: authed.userId,
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      coupon_discount: 0,
      final_amount: finalAmount,
      payment_method: paymentMethod ?? '미정',
      status: '결제전',
      recipient,
      phone,
      address,
      address_detail: '',
    })
    .select('order_id, final_amount')
    .single();

  if (orderError || !order) {
    await restoreStock(decremented);
    return NextResponse.json({ error: orderError?.message ?? '주문 생성 실패' }, { status: 500 });
  }

  // order_items 저장
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
    validatedItems.map((i) => ({
      order_id: orderId,
      product_id: i.productId,
      seller_id: i.sellerId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }))
  );

  if (itemsError) {
    const [deleteResult, unrestored] = await Promise.all([
      supabaseAdmin.from('orders').delete().eq('order_id', orderId),
      restoreStock(decremented),
    ]);
    if (deleteResult.error) {
      console.error(`[order] orphan order detected — rollback failed for ${orderId}:`, deleteResult.error.message);
    }
    if (unrestored.length > 0) {
      console.error(`[order] stock restore failed for products:`, unrestored);
    }
    return NextResponse.json({ error: '주문 상품 저장 실패' }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.order_id, finalAmount: order.final_amount });
}

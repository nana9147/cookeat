import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { totalAmount, shippingFee = 0, couponDiscount = 0, finalAmount, paymentMethod, recipient = '', phone = '', address = '' } = await req.json();

  if (!finalAmount || finalAmount <= 0) {
    return NextResponse.json({ error: '유효하지 않은 결제 금액입니다.' }, { status: 400 });
  }

  const orderId = `ORDER_${Date.now()}`;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_id: orderId,
      user_id: authed.userId,
      total_amount: totalAmount ?? finalAmount,
      shipping_fee: shippingFee,
      coupon_discount: couponDiscount,
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orderId: order.order_id, finalAmount: order.final_amount });
}

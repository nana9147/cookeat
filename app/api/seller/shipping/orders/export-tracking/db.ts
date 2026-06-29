import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getSellerShippingOrdersForTrackingExport(sellerId: number) {
  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerOrderIds = [...new Set((sellerItemRows ?? []).map((r) => r.order_id))];
  if (sellerOrderIds.length === 0) {
    return [];
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('order_id, recipient, users(nickname)')
    .in('order_id', sellerOrderIds)
    .eq('status', '배송준비');

  if (ordersError) throw ordersError;

  const orderIds = (orders ?? []).map((o) => o.order_id);
  if (orderIds.length === 0) {
    return [];
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id, order_id, quantity, products(name)')
    .eq('seller_id', sellerId)
    .in('order_id', orderIds);

  if (itemsError) throw itemsError;

  return (items ?? []).map((item) => {
    const order = (orders ?? []).find((o) => o.order_id === item.order_id);
    const product = item.products as unknown as { name: string } | null;

    return {
      orderId: item.order_id,
      recipient: order?.recipient ?? '',
      productName: product?.name ?? '알 수 없음',
      quantity: item.quantity,
      courier: '',
      trackingNumber: '',
    };
  });
}

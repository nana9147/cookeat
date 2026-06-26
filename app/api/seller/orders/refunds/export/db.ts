import { supabaseAdmin } from '@/lib/supabaseAdmin';

const MAX_EXPORT_BATCH_SIZE = 1000;

export async function getRefundsForExport(
  sellerId: number,
  options: { offset: number; limit: number; refundIds?: number[] }
) {
  const { offset } = options;
  const limit = Math.min(options.limit, MAX_EXPORT_BATCH_SIZE);

  const { data: sellerItemRows, error: sellerItemsError } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);

  if (sellerItemsError) throw sellerItemsError;

  const sellerItemIds = (sellerItemRows ?? []).map((r) => r.item_id);
  if (sellerItemIds.length === 0) {
    return { orders: [], total: 0 };
  }

  let query = supabaseAdmin
    .from('refund_requests')
    .select(
      'refund_id, status, request_reason, reject_reason, requested_at, processed_at, order_items(order_id, quantity, unit_price, products(name))',
      { count: 'exact' }
    )
    .in('item_id', sellerItemIds);

  if (options.refundIds) {
    query = query.in('refund_id', options.refundIds);
  }

  const {
    data: refunds,
    count,
    error: refundsError,
  } = await query.order('requested_at', { ascending: false }).range(offset, offset + limit - 1);

  if (refundsError) throw refundsError;

  const orderIds = [
    ...new Set(
      (refunds ?? []).map((r) => (r.order_items as unknown as { order_id: string }).order_id)
    ),
  ];

  const { data: orderRows, error: orderRowsError } = await supabaseAdmin
    .from('orders')
    .select('order_id, users(nickname)')
    .in('order_id', orderIds);

  if (orderRowsError) throw orderRowsError;

  const rows = (refunds ?? []).map((r) => {
    const orderItem = r.order_items as unknown as {
      order_id: string;
      quantity: number;
      unit_price: number;
      products: { name: string } | null;
    };
    const order = (orderRows ?? []).find((o) => o.order_id === orderItem.order_id);
    const user = order?.users as unknown as { nickname: string } | null;

    const status = r.reject_reason ? '거부됨' : r.status;

    return {
      orderId: orderItem.order_id,
      customer: user?.nickname ?? '알 수 없음',
      productName: orderItem.products?.name ?? '알 수 없음',
      quantity: orderItem.quantity,
      unitPrice: orderItem.unit_price,
      refundAmount: orderItem.quantity * orderItem.unit_price,
      status,
      requestReason: r.request_reason,
      rejectReason: r.reject_reason,
      requestedAt: r.requested_at,
      processedAt: r.processed_at,
    };
  });

  return { orders: rows, total: count ?? 0 };
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function logOrderItemStatusHistory(
  orderItemId: number,
  status: string,
  memo?: string
) {
  const { error } = await supabaseAdmin.from('order_item_status_history').insert({
    order_item_id: orderItemId,
    status,
    changed_at: new Date().toISOString(),
    memo: memo ?? null,
  });

  if (error) throw error;
}

export async function getLatestStatusChangeTime(
  orderItemId: number,
  status: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('order_item_status_history')
    .select('changed_at')
    .eq('order_item_id', orderItemId)
    .eq('status', status)
    .order('changed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.changed_at ?? null;
}

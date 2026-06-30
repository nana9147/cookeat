import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface CreateReviewReportParams {
  reviewId: number;
  sellerId: number;
  reporterId: number;
  reason: string;
}

export async function createReviewReport({
  reviewId,
  sellerId,
  reporterId,
  reason,
}: CreateReviewReportParams): Promise<void> {
  const { data: review, error: reviewError } = await supabaseAdmin
    .from('reviews')
    .select('review_id, status, products!inner(seller_id)')
    .eq('review_id', reviewId)
    .maybeSingle();

  if (reviewError) throw reviewError;
  if (!review) throw new Error('FORBIDDEN');

  const productSellerId = (review.products as unknown as { seller_id: number })?.seller_id;
  if (productSellerId !== sellerId) {
    throw new Error('FORBIDDEN');
  }

  const { data: existing } = await supabaseAdmin
    .from('review_reports')
    .select('report_id')
    .eq('review_id', reviewId)
    .eq('reporter_id', reporterId)
    .maybeSingle();

  if (existing) throw new Error('ALREADY_REPORTED');

  const { error: insertError } = await supabaseAdmin.from('review_reports').insert({
    review_id: reviewId,
    reporter_id: reporterId,
    reason,
  });

  if (insertError) throw insertError;

  if (review.status === '정상') {
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({ status: '신고' })
      .eq('review_id', reviewId);

    if (updateError) throw updateError;
  }
}

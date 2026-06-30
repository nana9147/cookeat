import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface UpsertReviewReplyParams {
  reviewId: number;
  sellerId: number;
  content: string;
}

interface ReviewReplyResult {
  replyId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function upsertReviewReply({
  reviewId,
  sellerId,
  content,
}: UpsertReviewReplyParams): Promise<ReviewReplyResult> {
  const { data: review, error: reviewError } = await supabaseAdmin
    .from('reviews')
    .select('review_id, products!inner(seller_id)')
    .eq('review_id', reviewId)
    .maybeSingle();

  if (reviewError) throw reviewError;
  if (!review) throw new Error('FORBIDDEN');

  const productSellerId = (review.products as unknown as { seller_id: number })?.seller_id;
  if (productSellerId !== sellerId) {
    throw new Error('FORBIDDEN');
  }

  const { data, error } = await supabaseAdmin
    .from('review_replies')
    .upsert(
      {
        review_id: reviewId,
        seller_id: sellerId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'review_id' }
    )
    .select('reply_id, content, created_at, updated_at')
    .single();

  if (error) throw error;

  return {
    replyId: data.reply_id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Review, ReviewStatus, ReviewTabFilter } from '@/types/seller/review';

interface GetSellerReviewsParams {
  sellerId: number;
  filter: ReviewTabFilter;
  ratingFilter?: number;
  sortOrder?: 'rating_desc' | 'rating_asc';
  keyword?: string;
  page: number;
  limit: number;
}

interface GetSellerReviewsResult {
  reviews: Review[];
  total: number;
}

type RpcReviewRow = {
  review_id: number;
  product_id: number;
  product_name: string;
  user_id: number;
  user_name: string | null;
  rating: number;
  content: string;
  status: ReviewStatus;
  created_at: string;
  reply_id: number | null;
  reply_content: string | null;
  reply_created_at: string | null;
  reply_updated_at: string | null;
  image_urls: string[] | null;
  report_count: number;
  total_count: number;
};

function mapRpcRow(row: RpcReviewRow): Review {
  return {
    reviewId: row.review_id,
    productId: row.product_id,
    productName: row.product_name,
    userId: row.user_id,
    userName: row.user_name ?? '알 수 없음',
    rating: row.rating,
    content: row.content,
    images: row.image_urls ?? [],
    status: row.status,
    reportCount: row.report_count,
    reply: row.reply_id
      ? {
          replyId: row.reply_id,
          content: row.reply_content ?? '',
          createdAt: row.reply_created_at ?? '',
          updatedAt: row.reply_updated_at ?? '',
        }
      : null,
    createdAt: row.created_at,
  };
}

export async function getSellerReviews({
  sellerId,
  filter,
  ratingFilter,
  sortOrder,
  keyword,
  page,
  limit,
}: GetSellerReviewsParams): Promise<GetSellerReviewsResult> {
  const offset = (page - 1) * limit;

  const { data, error } = await supabaseAdmin.rpc('get_seller_reviews', {
    p_seller_id: sellerId,
    p_filter: filter,
    p_rating: ratingFilter ?? null,
    p_keyword: keyword ?? null,
    p_limit: limit,
    p_offset: offset,
    p_sort_order: sortOrder ?? null,
  });

  if (error) throw error;

  const rows = (data ?? []) as RpcReviewRow[];
  const reviews = rows.map(mapRpcRow);
  const total = rows[0]?.total_count ?? 0;

  return { reviews, total };
}
interface SellerReviewSummary {
  totalCount: number;
  averageRating: number;
  pendingReplyCount: number;
}

export async function getSellerReviewSummary(sellerId: number): Promise<SellerReviewSummary> {
  const { data, error } = await supabaseAdmin.rpc('get_seller_review_summary', {
    p_seller_id: sellerId,
  });

  if (error) throw error;

  const row = data?.[0];
  return {
    totalCount: Number(row?.total_count ?? 0),
    averageRating: Number(row?.average_rating ?? 0),
    pendingReplyCount: Number(row?.pending_reply_count ?? 0),
  };
}

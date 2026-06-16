import { Star } from 'lucide-react';

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewSectionProps {
  averageRating: number;
  totalCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Review[];
  /** 더 보기 버튼 클릭 시 호출 */
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.round(rating) ? 'fill-yellow text-yellow' : 'text-border'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({
  averageRating,
  totalCount,
  ratingBreakdown,
  reviews,
  onLoadMore,
  hasMore,
}: ReviewSectionProps) {
  const maxCount = Math.max(...Object.values(ratingBreakdown), 1);

  return (
    <section>
      <h2 className="text-base font-semibold text-dark-text mb-4">
        리뷰 <span className="text-gray-text font-normal text-sm">{totalCount.toLocaleString()}</span>
      </h2>

      {/* 평점 요약 */}
      <div className="flex flex-col tablet:flex-row gap-5 p-4 rounded-xl bg-beige mb-6">
        {/* 평균 점수 */}
        <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 tablet:w-32">
          <span className="text-4xl font-bold text-dark-text">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size="md" />
          <span className="text-xs text-gray-text">{totalCount.toLocaleString()}개 리뷰</span>
        </div>

        {/* 별점 막대 */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingBreakdown[star] ?? 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-text w-3 shrink-0">{star}</span>
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-5 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <ul className="divide-y divide-border">
        {reviews.map((review) => (
          <li key={review.id} className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-card-bg flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-gray-text">
                  {review.authorName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-text">{review.authorName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted">{review.createdAt}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-text leading-relaxed">{review.content}</p>
          </li>
        ))}
      </ul>

      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full mt-4 h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
        >
          리뷰 더 보기
        </button>
      )}

      {reviews.length === 0 && (
        <p className="py-10 text-center text-sm text-light-gray">아직 리뷰가 없어요.</p>
      )}
    </section>
  );
}

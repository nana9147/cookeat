import { StarRating } from './StarRating';

interface RatingSummaryProps {
  averageRating: number;
  totalCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function RatingSummary({ averageRating, totalCount, ratingBreakdown }: RatingSummaryProps) {
  const maxCount = Math.max(...Object.values(ratingBreakdown), 1);

  return (
    <div className="flex flex-col tablet:flex-row gap-5 p-4 rounded-xl bg-hover">
      <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 tablet:w-32">
        <span className="text-4xl font-bold text-dark-text">{averageRating.toFixed(1)}</span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-xs text-gray-text">{totalCount.toLocaleString()}개 리뷰</span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = ratingBreakdown[star] ?? 0;
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-text w-3 shrink-0">{star}</span>
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-yellow transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs w-5 text-gray-text shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

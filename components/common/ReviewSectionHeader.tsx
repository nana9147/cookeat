'use client';

interface ReviewSectionHeaderProps {
  totalCount: number;
  canWrite: boolean;
  compact: boolean;
  onViewAll?: () => void;
  onWriteClick: () => void;
}

export function ReviewSectionHeader({
  totalCount,
  canWrite,
  compact,
  onViewAll,
  onWriteClick,
}: ReviewSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-dark-text">
        리뷰{' '}
        <span className="text-gray-text font-normal text-sm">{totalCount.toLocaleString()}</span>
      </h2>
      <div className="flex items-center gap-2">
        {canWrite && (
          <button
            onClick={onWriteClick}
            className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            리뷰 작성
          </button>
        )}
        {compact && onViewAll && totalCount > 0 && (
          <button onClick={onViewAll} className="text-xs text-primary hover:underline">
            전체보기
          </button>
        )}
      </div>
    </div>
  );
}

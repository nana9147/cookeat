import { SortOption } from '@/types/ingredient';

const SORT_OPTIONS: SortOption[] = ['추천순', '신상품순', '낮은가격순', '높은가격순', '별점순'];

interface ShoppingSortProps {
  totalCount: number;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function ShoppingSort({ totalCount, sortOption, onSortChange }: ShoppingSortProps) {
  return (
    <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between mb-4">
      <p className="text-sm text-gray-text shrink-0">
        총 <span className="font-semibold text-dark-text">{totalCount.toLocaleString()}개</span> 상품
      </p>
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {SORT_OPTIONS.map((opt, i) => (
          <span key={opt} className="flex items-center shrink-0">
            <button
              onClick={() => onSortChange(opt)}
              className={`px-2 py-1 text-xs transition-colors whitespace-nowrap ${
                sortOption === opt
                  ? 'text-dark-text font-semibold'
                  : 'text-light-gray hover:text-gray-text'
              }`}
            >
              {opt}
            </button>
            {i < SORT_OPTIONS.length - 1 && (
              <span className="text-border text-xs select-none">|</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

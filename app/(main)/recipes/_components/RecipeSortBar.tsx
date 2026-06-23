import { SortKey, SORT_OPTIONS } from '../types';

interface RecipeSortBarProps {
  total: number;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}

export default function RecipeSortBar({ total, sort, onSort }: RecipeSortBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-text">
        총 <span className="font-semibold text-dark-text">{total}</span>개 레시피
      </p>
      <div className="flex items-center gap-0.5">
        {SORT_OPTIONS.map((opt, i) => (
          <span key={opt.value} className="flex items-center">
            <button
              onClick={() => onSort(opt.value)}
              className={`px-2 py-1 text-xs transition-colors whitespace-nowrap ${
                sort === opt.value ? 'text-dark-text font-semibold' : 'text-light-gray hover:text-gray-text'
              }`}
            >
              {opt.label}
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

import { SortType, SORT_OPTIONS } from '../data/mockRecipes';

interface RecipeSortBarProps {
  total: number;
  sort: SortType;
  onSort: (s: SortType) => void;
}

export default function RecipeSortBar({ total, sort, onSort }: RecipeSortBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-text">
        총 <span className="font-semibold text-dark-text">{total}</span>개 레시피
      </p>
      <div className="flex items-center gap-0.5">
        {SORT_OPTIONS.map((opt, i) => (
          <span key={opt} className="flex items-center">
            <button
              onClick={() => onSort(opt)}
              className={`px-2 py-1 text-xs transition-colors whitespace-nowrap ${
                sort === opt ? 'text-dark-text font-semibold' : 'text-light-gray hover:text-gray-text'
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

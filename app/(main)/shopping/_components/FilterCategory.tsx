import { IngredientCategory } from '@/types/ingredient';

const CATEGORIES: IngredientCategory[] = [
  '전체', '채소', '과일·견과', '정육·계란', '수산·해산물',
  '쌀·잡곡', '유제품', '오일/소스', '밀키트',
];

interface FilterCategoryProps {
  selectedCategory: IngredientCategory;
  onCategoryChange: (category: IngredientCategory) => void;
}

export default function FilterCategory({ selectedCategory, onCategoryChange }: FilterCategoryProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-dark-text mb-2">카테고리</h3>
      <ul className="space-y-0.5">
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-text hover:bg-hover'
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

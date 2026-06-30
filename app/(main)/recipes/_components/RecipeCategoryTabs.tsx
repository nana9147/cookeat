import { RecipeCategory } from '../types';

interface RecipeCategoryTabsProps {
  categories: RecipeCategory[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
}

export default function RecipeCategoryTabs({ categories, selectedId, onChange }: RecipeCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-colors ${
          selectedId === null ? 'bg-primary text-white' : 'bg-card-bg text-gray-text hover:bg-border'
        }`}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.recipeCategoryId}
          onClick={() => onChange(cat.recipeCategoryId)}
          className={`shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-colors ${
            selectedId === cat.recipeCategoryId
              ? 'bg-primary text-white'
              : 'bg-card-bg text-gray-text hover:bg-border'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

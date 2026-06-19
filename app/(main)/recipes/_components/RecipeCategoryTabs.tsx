import { RecipeCategory, RECIPE_CATEGORIES } from '../data/mockRecipes';

interface RecipeCategoryTabsProps {
  selected: RecipeCategory;
  onChange: (cat: RecipeCategory) => void;
}

export default function RecipeCategoryTabs({ selected, onChange }: RecipeCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [scrollbar-width:none]">
      {RECIPE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-primary text-white'
              : 'bg-card-bg text-gray-text hover:bg-border'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

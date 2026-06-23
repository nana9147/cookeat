import { RecipeListItem } from '../types';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: RecipeListItem[];
  loading?: boolean;
}

export default function RecipeGrid({ recipes, loading }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card-bg animate-pulse aspect-3/4" />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-light-gray">조건에 맞는 레시피가 없어요.</div>
    );
  }

  return (
    <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.recipeId} recipe={recipe} />
      ))}
    </div>
  );
}

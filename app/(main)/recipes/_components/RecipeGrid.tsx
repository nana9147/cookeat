import { Recipe } from '../data/mockRecipes';
import RecipeCard from './RecipeCard';

export default function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-light-gray">
        조건에 맞는 레시피가 없어요.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

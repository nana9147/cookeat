'use client';

import Link from 'next/link';
import RecipeCard from './RecipeCard';
import { usePopularRecipes } from './useHomeData';

export default function PopularRecipeSection() {
  const { recipes, isLoading } = usePopularRecipes();

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-h4 font-bold text-dark-text">인기 레시피</h2>
        <Link href="/recipes" className="text-sm text-gray-text hover:text-dark-text transition-colors">
          더보기
        </Link>
      </div>
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-4">
        {isLoading && recipes.length === 0
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-48 rounded-xl border border-border bg-card-bg animate-pulse" />
            ))
          : recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.recipeId}
                recipeId={recipe.recipeId}
                title={recipe.title}
                image={recipe.thumbnail}
                author={recipe.author.nickname}
                rating={recipe.rating}
                reviewCount={recipe.reviewCount}
                priority={index === 0}
              />
            ))}
      </div>
    </section>
  );
}

'use client';

import RecipeCard from './RecipeCard';
import { usePopularRecipes } from './useHomeData';

const fallbackRecipes = [
  { title: '크림 버섯 파스타', image: '/images/categories/recipes/pasta.png', author: '쿠짓이', rating: 4.8, reviewCount: 110 },
  { title: '된장찌개', image: '/images/categories/recipes/doenjang.png', author: '파이터드', rating: 4.7, reviewCount: 50 },
  { title: '김치찌개', image: '/images/categories/recipes/kimchi.png', author: '마크멘탈', rating: 4.9, reviewCount: 312 },
  { title: '수비드 닭가슴살 샐러드', image: '/images/categories/recipes/bibimbap.png', author: '핫사이다', rating: 4.6, reviewCount: 88 },
  { title: '초코 티라미수', image: '/images/categories/recipes/toast.png', author: '달달해', rating: 4.9, reviewCount: 170 },
];

export default function PopularRecipeSection() {
  const { recipes, isLoading } = usePopularRecipes();
  const visibleRecipes = recipes.length > 0
    ? recipes.map((recipe) => ({
        title: recipe.title,
        image: recipe.thumbnail,
        author: recipe.author.nickname,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
      }))
    : fallbackRecipes;

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-h4 font-bold text-dark-text">인기 레시피</h2>
        <button className="text-sm text-gray-text hover:text-dark-text transition-colors">더보기</button>
      </div>
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-4">
        {isLoading && recipes.length === 0 ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-48 rounded-xl border border-border bg-card-bg animate-pulse" />
          ))
        ) : visibleRecipes.map((recipe) => (
          <RecipeCard key={recipe.title} {...recipe} />
        ))}
      </div>
    </section>
  );
}

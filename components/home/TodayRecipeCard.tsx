'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTodayRecipe } from './useHomeData';

export default function TodayRecipeCard() {
  const { recipe, isLoading } = useTodayRecipe();
  const title = recipe?.title ?? '나홀로 열무 비빔국수';
  const image = recipe?.thumbnail ?? '/images/categories/recipes/bibimbap.png';
  const author = recipe?.author.nickname ?? '김밥팔고';
  const rating = recipe?.rating ?? 4.8;
  const reviewCount = recipe?.reviewCount ?? 96;
  const href = recipe ? `/recipes/${recipe.recipeId}` : '/recipes';

  return (
    <div className="bg-white rounded-2xl p-4 border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-dark-text">오늘의 추천 레시피</h3>
        <Link href={href} className="text-xs text-gray-text hover:text-dark-text transition-colors">
          더보기
        </Link>
      </div>

      <Link href={href} className="block">
        <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-card-bg">
          <Image
            src={image}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            priority
          />
        </div>

        <h4 className="text-sm font-medium text-dark-text truncate">{title}</h4>
        <p className="text-xs text-gray-text mt-0.5">{author}</p>
        <p className="text-xs text-gray-text mt-1">⭐ {rating.toFixed(1)} ({reviewCount})</p>
      </Link>
    </div>
  );
}

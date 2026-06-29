'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, Users, UtensilsCrossed } from 'lucide-react';
import { RecipeListItem } from '../types';
import { useBookmark } from '@/hooks/user/useBookmark';

export default function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const { isActive: liked, toggle, loading } = useBookmark(recipe.recipeId);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
      <Link href={`/recipes/${recipe.recipeId}`} className="flex flex-col flex-1">
        <div className="relative aspect-4/3 bg-card-bg">
          {recipe.thumbnail ? (
            <Image src={recipe.thumbnail} alt={recipe.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-muted" />
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(); }}
            disabled={loading}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-50"
            aria-label="북마크"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${liked ? 'fill-red text-red' : 'text-gray-text'}`}
            />
          </button>
        </div>

        <div className="flex flex-col flex-1 p-3 gap-1">
          <p className="text-xs text-primary font-medium">{recipe.recipeCategoryName}</p>
          <p className="text-sm font-medium text-dark-text leading-snug line-clamp-2">{recipe.title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-text mt-0.5">
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {recipe.cookingTime}분
            </span>
            <span className="flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {recipe.servings}인분
            </span>
          </div>
          <p className="text-xs text-light-gray">{recipe.author.nickname}</p>
          <div className="flex items-center gap-1 text-xs text-gray-text mt-auto pt-1">
            <span className="text-yellow">★</span>
            <span>{recipe.rating.toFixed(1)}</span>
            <span className="text-muted">({recipe.reviewCount})</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

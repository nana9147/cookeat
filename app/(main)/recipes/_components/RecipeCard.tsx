'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Clock, Users, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '../data/mockRecipes';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
      <Link href={`/recipes/${recipe.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-4/3 bg-card-bg">
          {recipe.imageUrl ? (
            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-muted" />
            </div>
          )}
          {recipe.isNew && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">
              NEW
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); setLiked((p) => !p); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label="북마크"
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red text-red' : 'text-gray-text'}`} />
          </button>
        </div>

        <div className="flex flex-col flex-1 p-3 gap-1">
          <p className="text-xs text-primary font-medium">{recipe.category}</p>
          <p className="text-sm font-medium text-dark-text leading-snug line-clamp-2">{recipe.title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-text mt-0.5">
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{recipe.cookTime}분</span>
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{recipe.servings}인분</span>
          </div>
          <p className="text-xs text-light-gray">{recipe.author}</p>
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

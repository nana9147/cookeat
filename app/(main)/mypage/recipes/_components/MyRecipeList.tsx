'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UtensilsCrossed } from 'lucide-react';
import api from '@/lib/api';
import OrderPagination from '../../orders/_components/OrderPagination';
import type { Pagination } from '../../orders/_components/types';

type MyRecipe = {
  recipeId: number; title: string; thumbnail: string | null;
  recipeCategoryName: string; difficulty: string;
  cookingTime: number; servings: number; likeCount: number; scrapCount: number;
};

export default function MyRecipeList() {
  const [recipes, setRecipes] = useState<MyRecipe[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<{ recipes: MyRecipe[]; pagination: Pagination }>(`/users/me/recipes?page=${page}`)
      .then(({ data }) => { if (!cancelled) { setRecipes(data.recipes); setPagination(data.pagination); } })
      .catch(() => { if (!cancelled) setRecipes([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-text">내 레시피</h3>
        {pagination && <span className="text-xs text-gray-text">총 {pagination.total}건</span>}
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="rounded-xl h-52 bg-beige animate-pulse" />)}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <UtensilsCrossed className="w-12 h-12 text-muted" />
          <p className="text-sm text-gray-text">작성한 레시피가 없습니다.</p>
          <Link href="/recipes/write" className="text-xs text-primary hover:underline">레시피 작성하기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((r) => (
            <Link key={r.recipeId} href={`/recipes/${r.recipeId}`} className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
              <div className="relative aspect-4/3 bg-card-bg">
                {r.thumbnail
                  ? <Image src={r.thumbnail} alt={r.title} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-8 h-8 text-muted" /></div>
                }
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-xs text-primary">{r.recipeCategoryName}</p>
                <p className="text-sm font-medium text-dark-text line-clamp-2">{r.title}</p>
                <p className="text-xs text-gray-text">{r.cookingTime}분 · {r.servings}인분 · {r.difficulty}</p>
                <div className="flex gap-2 text-xs text-gray-text mt-0.5">
                  <span>♥ {r.likeCount}</span>
                  <span>⊡ {r.scrapCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pagination && pagination.total > pagination.limit && (
        <OrderPagination page={page} total={pagination.total} limit={pagination.limit} hasNext={pagination.hasNext} onPageChange={setPage} />
      )}
    </div>
  );
}

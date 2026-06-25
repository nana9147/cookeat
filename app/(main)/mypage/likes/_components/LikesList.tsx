'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import OrderPagination from '../../orders/_components/OrderPagination';
import type { Pagination } from '../../orders/_components/types';

const TABS = ['레시피', '재료쇼핑'] as const;
type LikeTab = (typeof TABS)[number];

type BookmarkedRecipe = {
  recipeId: number; title: string; thumbnail: string | null;
  recipeCategoryName: string; difficulty: string;
  cookingTime: number; servings: number; author: { nickname: string };
};

export default function LikesList() {
  const [activeTab, setActiveTab] = useState<LikeTab>('레시피');
  const [recipes, setRecipes] = useState<BookmarkedRecipe[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab !== '레시피') return;
    let cancelled = false;
    setLoading(true);
    api.get<{ recipes: BookmarkedRecipe[]; pagination: Pagination }>(`/users/me/bookmarks?page=${page}`)
      .then(({ data }) => { if (!cancelled) { setRecipes(data.recipes); setPagination(data.pagination); } })
      .catch(() => { if (!cancelled) setRecipes([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, activeTab]);

  const handleTabChange = (tab: LikeTab) => { setActiveTab(tab); setPage(1); };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-dark-text">찜 목록</h3>
      <div className="flex gap-1.5">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => handleTabChange(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-beige text-gray-text hover:bg-primary/10'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '레시피' ? (
        loading ? (
          <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map((i) => <div key={i} className="rounded-xl h-52 bg-beige animate-pulse" />)}</div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <UtensilsCrossed className="w-12 h-12 text-muted" />
            <p className="text-sm text-gray-text">북마크한 레시피가 없습니다.</p>
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
                  <p className="text-xs text-gray-text">{r.cookingTime}분 · {r.author.nickname}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ShoppingBag className="w-12 h-12 text-muted" />
          <p className="text-sm text-gray-text">재료쇼핑 찜 기능은 준비 중입니다.</p>
        </div>
      )}

      {activeTab === '레시피' && pagination && pagination.total > pagination.limit && (
        <OrderPagination page={page} total={pagination.total} limit={pagination.limit} hasNext={pagination.hasNext} onPageChange={setPage} />
      )}
    </div>
  );
}

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

type WishlistProduct = {
  wishlistId: number; productId: number; name: string; image: string;
  price: number; discountedPrice: number; seller: string;
};

export default function LikesList() {
  const [activeTab, setActiveTab] = useState<LikeTab>('레시피');

  const [recipes, setRecipes] = useState<BookmarkedRecipe[]>([]);
  const [recipePagination, setRecipePagination] = useState<Pagination | null>(null);
  const [recipePage, setRecipePage] = useState(1);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [productPagination, setProductPagination] = useState<Pagination | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== '레시피') return;
    let cancelled = false;

    const fetchRecipes = () => {
      setRecipeLoading(true);
      api.get<{ recipes: BookmarkedRecipe[]; pagination: Pagination }>(`/users/me/bookmarks?page=${recipePage}`)
        .then(({ data }) => { if (!cancelled) { setRecipeError(null); setRecipes(data.recipes); setRecipePagination(data.pagination); } })
        .catch(() => { if (!cancelled) setRecipeError('북마크 목록을 불러오지 못했습니다.'); })
        .finally(() => { if (!cancelled) setRecipeLoading(false); });
    };

    fetchRecipes();
    return () => { cancelled = true; };
  }, [recipePage, activeTab]);

  useEffect(() => {
    if (activeTab !== '재료쇼핑') return;
    let cancelled = false;

    const fetchProducts = () => {
      setProductLoading(true);
      api.get<{ products: WishlistProduct[]; pagination: Pagination }>(`/users/me/wishlists?page=${productPage}`)
        .then(({ data }) => { if (!cancelled) { setProductError(null); setProducts(data.products); setProductPagination(data.pagination); } })
        .catch((e) => { if (!cancelled) { console.error('[wishlists]', e); setProductError('찜 목록을 불러오지 못했습니다.'); } })
        .finally(() => { if (!cancelled) setProductLoading(false); });
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [productPage, activeTab]);

  const handleTabChange = (tab: LikeTab) => { setActiveTab(tab); };

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
        recipeLoading ? (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">{[1,2,3,4,5,6].map((i) => <div key={i} className="rounded-xl h-52 bg-beige animate-pulse" />)}</div>
        ) : recipeError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-red">{recipeError}</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <UtensilsCrossed className="w-12 h-12 text-muted" />
            <p className="text-sm text-gray-text">북마크한 레시피가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
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
        productLoading ? (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">{[1,2,3,4,5,6].map((i) => <div key={i} className="rounded-xl h-52 bg-beige animate-pulse" />)}</div>
        ) : productError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-red">{productError}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingBag className="w-12 h-12 text-muted" />
            <p className="text-sm text-gray-text">찜한 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
            {products.map((p) => (
              <Link key={p.wishlistId} href={`/shopping/${p.productId}`} className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
                <div className="relative aspect-square bg-card-bg">
                  {p.image
                    ? <Image src={p.image} alt={p.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted" /></div>
                  }
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-sm font-medium text-dark-text line-clamp-2">{p.name}</p>
                  {p.discountedPrice < p.price && (
                    <p className="text-xs line-through text-muted">{p.price.toLocaleString()}원</p>
                  )}
                  <p className="text-sm font-bold text-dark-text">{p.discountedPrice.toLocaleString()}원</p>
                  <p className="text-xs text-light-gray">{p.seller}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {activeTab === '레시피' && recipePagination && recipePagination.total > recipePagination.limit && (
        <OrderPagination page={recipePage} total={recipePagination.total} limit={recipePagination.limit} hasNext={recipePagination.hasNext} onPageChange={setRecipePage} />
      )}
      {activeTab === '재료쇼핑' && productPagination && productPagination.total > productPagination.limit && (
        <OrderPagination page={productPage} total={productPagination.total} limit={productPagination.limit} hasNext={productPagination.hasNext} onPageChange={setProductPage} />
      )}
    </div>
  );
}

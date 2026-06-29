'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';

type RecipeResult = {
  recipeId: number; title: string; thumbnail: string | null;
  recipeCategoryName: string; cookingTime: number; author: { nickname: string };
};
type ProductResult = {
  productId: number; name: string; image: string | null;
  price: number; discountRate?: number; seller: string; rating: number;
};

export default function SearchClient({ keyword }: { keyword: string }) {
  const [recipes, setRecipes] = useState<RecipeResult[]>([]);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/recipes?keyword=${encodeURIComponent(keyword)}&limit=8`).then((r) => r.json()),
      fetch(`/api/products?keyword=${encodeURIComponent(keyword)}&limit=8`).then((r) => r.json()),
    ])
      .then(([recipeJson, productJson]) => {
        if (cancelled) return;
        setRecipes(recipeJson?.data?.recipes ?? []);
        setProducts(productJson?.data?.products ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [keyword]);

  if (!keyword.trim()) {
    return <p className="py-20 text-center text-sm text-gray-text">검색어를 입력해주세요.</p>;
  }

  if (loading) {
    return (
      <div className="space-y-8 mt-6">
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl h-40 bg-beige animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl h-40 bg-beige animate-pulse" />)}
        </div>
      </div>
    );
  }

  const noResults = recipes.length === 0 && products.length === 0;
  if (noResults) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <UtensilsCrossed className="w-12 h-12 text-muted" />
        <p className="text-sm text-gray-text">&apos;{keyword}&apos;에 대한 검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 mt-6">
      {/* 레시피 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-dark-text">레시피 <span className="text-primary">{recipes.length}</span></h3>
          {recipes.length > 0 && (
            <Link href={`/recipes?keyword=${encodeURIComponent(keyword)}`} className="text-xs text-primary hover:underline">
              전체보기
            </Link>
          )}
        </div>
        {recipes.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted">
            <UtensilsCrossed className="w-5 h-5" /> 레시피 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
            {recipes.map((r) => (
              <Link key={r.recipeId} href={`/recipes/${r.recipeId}`}
                className="rounded-xl overflow-hidden border border-border bg-white flex flex-col hover:shadow-md transition-shadow">
                <div className="relative aspect-4/3 bg-card-bg">
                  {r.thumbnail
                    ? <Image src={r.thumbnail} alt={r.title} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-8 h-8 text-muted" /></div>
                  }
                </div>
                <div className="p-3 flex flex-col gap-0.5">
                  <p className="text-xs text-primary">{r.recipeCategoryName}</p>
                  <p className="text-sm font-medium text-dark-text line-clamp-2">{r.title}</p>
                  <p className="text-xs text-gray-text">{r.cookingTime}분 · {r.author.nickname}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 재료쇼핑 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-dark-text">재료쇼핑 <span className="text-primary">{products.length}</span></h3>
          {products.length > 0 && (
            <Link href={`/shopping?keyword=${encodeURIComponent(keyword)}`} className="text-xs text-primary hover:underline">
              전체보기
            </Link>
          )}
        </div>
        {products.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted">
            <ShoppingBag className="w-5 h-5" /> 재료 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
            {products.map((p) => {
              const discounted = p.discountRate ? Math.round(p.price * (1 - p.discountRate / 100)) : p.price;
              return (
                <Link key={p.productId} href={`/shopping/${p.productId}`}
                  className="rounded-xl overflow-hidden border border-border bg-white flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-card-bg">
                    {p.image
                      ? <Image src={p.image} alt={p.name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted" /></div>
                    }
                  </div>
                  <div className="p-3 flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-dark-text line-clamp-2">{p.name}</p>
                    {p.discountRate && <p className="text-xs line-through text-muted">{p.price.toLocaleString()}원</p>}
                    <p className="text-sm font-bold text-dark-text">{discounted.toLocaleString()}원</p>
                    <p className="text-xs text-light-gray">{p.seller}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export interface RecipeIngredient {
  id: string;
  name: string;
  /** 1인분 기준 양 (예: "100g", "2개") */
  amountPerServing: string;
  pricePerServing: number;
  imageUrl?: string;
  /** 마켓에서 구매 가능 여부 */
  purchasable?: boolean;
}

interface RecipeIngredientListProps {
  ingredients: RecipeIngredient[];
  /** 장바구니 담기 콜백 */
  onAddToCart?: (selectedIds: string[], servings: number) => void;
}

function IngredientImage({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} className="w-9 h-9 rounded-full object-cover" />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-card-bg flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
        />
      </svg>
    </div>
  );
}

export default function RecipeIngredientList({
  ingredients,
  onAddToCart,
}: RecipeIngredientListProps) {
  const [servings, setServings] = useState(2);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(ingredients.filter((i) => i.purchasable !== false).map((i) => i.id))
  );
  const [showPrice, setShowPrice] = useState(true);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allChecked = ingredients.every((i) => checkedIds.has(i.id));
    setCheckedIds(allChecked ? new Set() : new Set(ingredients.map((i) => i.id)));
  };

  const selectedIngredients = ingredients.filter((i) => checkedIds.has(i.id));
  const totalPrice = selectedIngredients.reduce(
    (sum, i) => sum + i.pricePerServing * servings,
    0
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-beige border-b border-border">
        <h3 className="text-sm font-semibold text-dark-text">재료</h3>
        <div className="flex items-center gap-3">
          {/* 인분 조절 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setServings((p) => Math.max(1, p - 1))}
              className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-gray-text hover:bg-hover transition-colors"
              aria-label="인분 감소"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm text-dark-text w-12 text-center">{servings}인분</span>
            <button
              onClick={() => setServings((p) => p + 1)}
              className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-gray-text hover:bg-hover transition-colors"
              aria-label="인분 증가"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {/* 가격 토글 */}
          <button
            onClick={() => setShowPrice((p) => !p)}
            className={`text-xs px-2.5 h-6 rounded-full border transition-colors ${
              showPrice
                ? 'border-primary bg-primary text-white'
                : 'border-border text-gray-text hover:bg-hover'
            }`}
          >
            가격
          </button>
        </div>
      </div>

      {/* 전체 선택 행 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ingredients.length > 0 && ingredients.every((i) => checkedIds.has(i.id))}
            onChange={toggleAll}
            className="accent-primary w-4 h-4"
          />
          <span className="text-xs text-gray-text">재료 선택</span>
        </label>
        {showPrice && (
          <span className="text-xs text-gray-text">1인분 기준</span>
        )}
      </div>

      {/* 재료 목록 */}
      <ul className="divide-y divide-border bg-white">
        {ingredients.map((item) => {
          const scaledAmount = item.amountPerServing;
          const scaledPrice = item.pricePerServing * servings;
          return (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={checkedIds.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="accent-primary w-4 h-4 shrink-0"
              />
              <IngredientImage name={item.name} imageUrl={item.imageUrl} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dark-text truncate">{item.name}</p>
                <p className="text-xs text-light-gray">{scaledAmount}</p>
              </div>
              {showPrice && (
                <p className="text-sm font-medium text-dark-text shrink-0">
                  {scaledPrice.toLocaleString()}원
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* 합계 및 담기 버튼 */}
      {onAddToCart && (
        <div className="px-4 py-3 border-t border-border bg-beige">
          {showPrice && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-text">
                선택 재료 합계 ({selectedIngredients.length}개)
              </span>
              <span className="text-base font-bold text-dark-text">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          )}
          <button
            onClick={() => onAddToCart([...checkedIds], servings)}
            disabled={checkedIds.size === 0}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            장바구니에 모두 담기
          </button>
        </div>
      )}
    </div>
  );
}

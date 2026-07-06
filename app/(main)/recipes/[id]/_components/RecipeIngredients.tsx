'use client';

import { ShoppingCart } from 'lucide-react';
import { RecipeIngredient } from '../../types';
import RecipeIngredientItem from './RecipeIngredientItem';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  recipeId: number;
}

export default function RecipeIngredients({ ingredients, recipeId }: RecipeIngredientsProps) {
  const addItems = useCartStore((s) => s.addItems);
  const total = ingredients.reduce((sum, i) => sum + (i.product?.price ?? 0), 0);
  const purchasableIngredients = ingredients.filter((i) => i.product !== null);
  const hasPurchasable = purchasableIngredients.length > 0;

  const handleAddAll = () => {
    addItems(
      purchasableIngredients.map((i) => ({
        productId: i.product!.productId,
        quantity: 1,
        recipeId,
      }))
    );
    toast.success('재료를 모두 장바구니에 담았습니다.');
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-dark-text">
          재료 <span className="text-gray-text font-normal text-sm">{ingredients.length}</span>
        </h2>
        {hasPurchasable && (
          <div className="flex items-center gap-2 text-xs text-gray-text">
            <button className="hover:text-dark-text transition-colors">직접 구매하기</button>
            <span className="text-border">|</span>
            <button className="hover:text-dark-text transition-colors">재료 묶음 추가</button>
          </div>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card-bg">
        {ingredients.map((item) => (
          <RecipeIngredientItem key={item.id} ingredient={item} recipeId={recipeId} />
        ))}
      </div>

      {total > 0 && (
        <>
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-sm text-gray-text">재료 합계 금액</p>
            <p className="text-base font-bold text-dark-text">{total.toLocaleString()}원</p>
          </div>
          <button
            onClick={handleAddAll}
            className="w-full mt-3 h-11 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            장바구니에 모두 담기
          </button>
          <p className="text-center text-xs text-light-gray mt-2">
            재료 쇼핑몰에서 구매하고 포인트를 적립하세요
          </p>
        </>
      )}
    </section>
  );
}

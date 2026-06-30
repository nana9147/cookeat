import { ShoppingCart } from 'lucide-react';
import { RecipeIngredient } from '../../types';

export default function RecipeIngredientItem({ ingredient }: { ingredient: RecipeIngredient }) {
  const amountText = `${ingredient.amount}${ingredient.unit}`;
  const price = ingredient.product?.price ?? null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <input type="checkbox" className="w-4 h-4 rounded accent-primary" defaultChecked />
      <div className="w-9 h-9 rounded-lg bg-card-bg shrink-0 flex items-center justify-center">
        <span className="text-xs text-muted">🥄</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-text">{ingredient.name}</p>
        <p className="text-xs text-gray-text">{amountText}</p>
      </div>
      {price !== null && (
        <p className="text-sm font-semibold text-dark-text shrink-0">{price.toLocaleString()}원</p>
      )}
      {ingredient.product && (
        <button
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-gray-text hover:border-primary hover:text-primary transition-colors shrink-0"
          aria-label="장바구니 담기"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

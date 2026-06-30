'use client';

import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface IngredientCartControlProps {
  qty: number;
  stock: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function IngredientCartControl({
  qty,
  stock,
  onAdd,
  onIncrement,
  onDecrement,
}: IngredientCartControlProps) {
  return (
    <div className="px-3 pb-3">
      {qty === 0 ? (
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-1 w-full h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          담기
        </button>
      ) : (
        <div className="flex items-center border border-primary rounded-lg overflow-hidden h-8">
          <button
            onClick={onDecrement}
            className="w-8 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors h-full shrink-0"
            aria-label="수량 감소"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold text-dark-text flex-1 text-center">{qty}</span>
          <button
            onClick={onIncrement}
            disabled={qty >= stock}
            className="w-8 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors h-full shrink-0 disabled:opacity-40"
            aria-label="수량 증가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

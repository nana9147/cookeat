'use client';

import { Heart, ShoppingCart } from 'lucide-react';

interface Props {
  liked: boolean;
  onToggleLike: () => void;
  disabled: boolean;
  onAddToCart: () => void;
}

export function PurchaseActionButtons({ liked, onToggleLike, disabled, onAddToCart }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onToggleLike}
        className={`flex items-center justify-center gap-1 h-11 px-3 rounded-xl border text-sm font-medium transition-colors shrink-0 ${
          liked ? 'border-red text-red bg-red/5' : 'border-border text-gray-text hover:bg-hover'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-red' : ''}`} />
        <span className="hidden tablet:inline">찜하기</span>
      </button>
      <button
        onClick={onAddToCart}
        disabled={disabled}
        className="flex items-center justify-center gap-1.5 flex-1 h-11 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-4 h-4" />
        장바구니
      </button>
    </div>
  );
}

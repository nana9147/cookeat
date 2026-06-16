'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { ShoppingProduct } from '@/types/ingredient';
import IngredientCardImage from './IngredientCardImage';

interface IngredientCardProps {
  product: ShoppingProduct;
}

export default function IngredientCard({ product }: IngredientCardProps) {
  const [qty, setQty] = useState(0);

  const discountedPrice = product.discountRate
    ? Math.round(product.price * (1 - product.discountRate / 100))
    : product.price;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
      {/* 이미지 + 텍스트 정보 → 상세 페이지 이동 */}
      <Link href={`/shopping/${product.id}`} className="flex flex-col flex-1">
        <IngredientCardImage product={product} />

        <div className="flex flex-col flex-1 p-3 gap-1">
          <p className="text-xs text-primary font-medium">{product.category}</p>
          <p className="text-sm font-medium text-dark-text leading-snug line-clamp-2">{product.name}</p>

          <div className="mt-0.5">
            <p className={`text-xs line-through ${product.discountRate ? 'text-muted' : 'invisible'}`}>
              {product.price.toLocaleString()}원
            </p>
            <p className="text-sm tablet:text-base font-bold text-dark-text">{discountedPrice.toLocaleString()}원</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-text">
            <span className="text-yellow">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted">({product.reviewCount.toLocaleString()})</span>
          </div>

          <p className="text-xs text-light-gray">{product.seller}</p>
        </div>
      </Link>

      {/* 담기 버튼 — 링크 밖에서 독립 동작 */}
      <div className="px-3 pb-3">
        {qty === 0 ? (
          <button
            onClick={() => setQty(1)}
            className="flex items-center justify-center gap-1 w-full h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            담기
          </button>
        ) : (
          <div className="flex items-center border border-primary rounded-lg overflow-hidden h-8">
            <button
              onClick={() => setQty((prev) => Math.max(0, prev - 1))}
              className="w-8 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors h-full shrink-0"
              aria-label="수량 감소"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold text-dark-text flex-1 text-center">{qty}</span>
            <button
              onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
              className="w-8 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors h-full shrink-0"
              aria-label="수량 증가"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

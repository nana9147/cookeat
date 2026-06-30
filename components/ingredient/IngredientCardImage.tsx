'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { ShoppingProduct } from '@/types/ingredient';
import { useWishlist } from '@/hooks/user/useWishlist';

interface IngredientCardImageProps {
  product: ShoppingProduct;
}

export default function IngredientCardImage({ product }: IngredientCardImageProps) {
  const { isActive: liked, toggle, loading } = useWishlist(Number(product.id));

  return (
    <div className="relative aspect-square bg-card-bg">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1440px) 33vw, 25vw"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {(product.isNew || product.discountRate) && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {product.isNew && (
            <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">NEW</span>
          )}
          {product.discountRate && (
            <span className="bg-red text-white text-xs font-bold px-1.5 py-0.5 rounded">{product.discountRate}%</span>
          )}
        </div>
      )}

      <button
        onClick={(e) => { e.preventDefault(); toggle(); }}
        disabled={loading}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-50"
        aria-label="위시리스트"
      >
        <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red text-red' : 'text-gray-text'}`} />
      </button>
    </div>
  );
}

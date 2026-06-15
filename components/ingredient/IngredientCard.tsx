import { ShoppingCart } from 'lucide-react';
import { ShoppingProduct } from '@/types/ingredient';
import IngredientCardImage from './IngredientCardImage';

interface IngredientCardProps {
  product: ShoppingProduct;
}

export default function IngredientCard({ product }: IngredientCardProps) {
  const discountedPrice = product.discountRate
    ? Math.round(product.price * (1 - product.discountRate / 100))
    : product.price;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white flex flex-col">
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

        <button className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors mt-auto">
          <ShoppingCart className="w-4 h-4" />
          담기
        </button>
      </div>
    </div>
  );
}

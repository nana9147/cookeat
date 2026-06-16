import { CategoryName } from './seller/product';

export type { CategoryName };

export type IngredientCategory = CategoryName | '전체';

export type SortOption = '추천순' | '신상품순' | '낮은가격순' | '높은가격순' | '별점순';

export interface ShoppingProduct {
  id: string;
  name: string;
  category: CategoryName;
  price: number;
  discountRate?: number;
  rating: number;
  reviewCount: number;
  seller: string;
  imageUrl?: string;
  isNew?: boolean;
  stock: number;
  volume?: string;
}

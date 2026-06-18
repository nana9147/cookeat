//import { CategoryName } from './seller/product';

//export type { CategoryName };
export type CategoryName =
  | '채소'
  | '과일·견과'
  | '정육·계란'
  | '수산·해산물'
  | '쌀·잡곡'
  | '유제품'
  | '오일/소스'
  | '밀키트';

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

// API 응답 타입
export interface ProductListItem {
  productId: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: CategoryName;
  seller: string;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
}

export interface ProductDetail {
  productId: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  origin: string;
  stock: number;
  ingredientId: number | null;
  category: string;
  sellerId: number | null;
  seller: string;
  sellerPhone: string;
  rating: number;
  reviewCount: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: ProductListItem[];
    sellers: string[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
  };
}

export type CategoryCode = 'veg' | 'fru' | 'mea' | 'sea' | 'gra' | 'dai' | 'sau' | 'kit';

export type CategoryName =
  | '채소'
  | '과일·견과'
  | '정육·계란'
  | '수산·해산물'
  | '쌀·잡곡'
  | '유제품'
  | '오일/소스'
  | '밀키트';

export type ProductStatus = '판매중' | '품절' | '판매종료';

export interface Product {
  id: string;
  name: string;
  category: CategoryName;
  price: number;
  stock: number;
  linkedRecipeCount: number;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'linkedRecipeCount' | 'createdAt'>;

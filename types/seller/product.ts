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
  store: string;
  createdAt: string;
}

export type ProductData = Omit<Product, 'id' | 'linkedRecipeCount' | 'createdAt'>;

// 기본 정보
export interface BasicInfoFieldProps {
  name: string;
  category: string;
  manufacturer: string;
  origin: string;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onManufacturerChange: (value: string) => void;
  onOriginChange: (value: string) => void;
}

// 판매 정보
export type DiscountType = 'none' | 'amount' | 'rate';

export interface PricingFieldProps {
  price: string;
  stock: string;
  discountType: DiscountType;
  discountValue: string;
  minQuantity: string;
  maxQuantity: string;
  onPriceChange: (value: string) => void;
  onStockChange: (value: string) => void;
  onDiscountTypeChange: (value: DiscountType) => void;
  onDiscountValueChange: (value: string) => void;
  onMinQuantityChange: (value: string) => void;
  onMaxQuantityChange: (value: string) => void;
}

// 전체 폼 데이터
export interface ProductFormData {
  // 기본 정보
  category: string;
  name: string;
  manufacturer: string;
  origin: string;
  // 판매 정보
  price: string;
  stock: string;
  discountType: DiscountType;
  discountValue: string;
  minQuantity: string;
  maxQuantity: string;
}

export const initialProductForm: ProductFormData = {
  category: '',
  name: '',
  manufacturer: '',
  origin: '',
  price: '',
  stock: '',
  discountType: 'none',
  discountValue: '',
  minQuantity: '',
  maxQuantity: '',
};

//이미지
export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface SortableImageProps {
  image: ImageFile;
  index: number;
  onRemove: (id: string) => void;
  onMoveFirst: (id: string) => void;
}

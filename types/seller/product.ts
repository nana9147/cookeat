import { ShippingData } from './shipping';

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

export type FoodType = CategoryName | '기타';

export type ProductStatus = '판매대기' | '판매중' | '품절' | '판매종료';

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

// 상품등록 - 기본 정보
export interface BasicInfoData {
  category: string;
  name: string;
  manufacturer: string;
  origin: string;
  status: ProductStatus;
}
export interface BasicInfoFieldProps {
  data: BasicInfoData;
  onChange: (field: keyof BasicInfoData, value: string) => void;
}

//  상품등록 - 판매 정보
export type DiscountType = 'none' | 'amount' | 'rate';

export interface PricingData {
  price: string;
  stock: string;
  discountType: DiscountType;
  discountValue: string;
  minQuantity: string;
  maxQuantity: string;
}
export interface PricingFieldProps {
  data: PricingData;
  onChange: (field: keyof PricingData, value: string) => void;
}

// 상품등록 - 이미지
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

// 정보 제공 고시
export interface ProductInfoData {
  infoItemName: string; // 품목 또는 명칭
  infoFoodType: FoodType; // 식품의 유형
  infoProducer: string; // 생산자/수입자
  infoOrigin: string; // 원산지
  infoExpirationDate: string; // 제조연월일/유통기한
  infoStorageMethod: string; // 보관방법
  infoWeight: string; // 중량/용량
}
export interface ProductInfoFieldProps {
  data: ProductInfoData;
  onChange: <K extends keyof ProductInfoData>(field: K, value: ProductInfoData[K]) => void;
}

//  상품등록 - 전체 폼 데이터
export interface ProductFormData {
  basicInfo: BasicInfoData;
  pricingInfo: PricingData;
  shippingInfo: ShippingData;
  productInfo: ProductInfoData;
}

export const initialProductForm: ProductFormData = {
  // 기본 정보
  basicInfo: {
    category: '',
    name: '',
    manufacturer: '',
    origin: '',
    status: '판매대기',
  },
  // 판매 정보
  pricingInfo: {
    price: '',
    stock: '',
    discountType: 'none',
    discountValue: '',
    minQuantity: '',
    maxQuantity: '',
  },
  //배송 정보
  shippingInfo: {
    deliveryMethod: '택배',
    shippingFeeType: '유료',
    shippingFee: '',
    returnFee: '',
    freeThreshold: '',
    originAddress: '',
    returnAddress: '',
  },
  //정보제공고시
  productInfo: {
    infoItemName: '',
    infoFoodType: '채소',
    infoProducer: '',
    infoOrigin: '',
    infoExpirationDate: '',
    infoStorageMethod: '',
    infoWeight: '',
  },
};

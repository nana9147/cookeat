import { NonReturnReason, ShippingFeeType } from './shipping';

export type CategoryName =
  | '채소'
  | '과일·견과·쌀'
  | '수산·해산물·건어물'
  | '정육·가공육·달걀'
  | '면·양념·오일'
  | '유제품'
  | '베이커리';

export type FoodType = CategoryName | '기타';

export type ProductStatus = '판매중' | '품절' | '판매종료' | '숨김';
export interface CategoryNode {
  categoryId: number;
  name: string;
  children: { categoryId: number; name: string }[];
}

export interface Product {
  productId: number;
  name: string;
  price: number;
  stock: number | null;
  linkedRecipeCount: number;
  status: ProductStatus | null;
  image: string;
  brand: string | null;
  categoryId: number | null;
  categories: { name: string; parent_id: number | null } | null;
  createdAt: string;
}

export type ProductData = Omit<Product, 'id' | 'linkedRecipeCount' | 'createdAt'>;

// 상품 이미지
export interface ProductImageItem {
  id: string;
  preview: string;
  file?: File; // 신규 업로드는 File, 기존 이미지는 URL만
}

export interface ImageUploadData {
  images: ProductImageItem[];
}

export interface ImageUploadFieldProps {
  data: ImageUploadData;
  onChange: (images: ProductImageItem[]) => void;
}

// 상품 설명
export interface DescriptionData {
  content: string;
}

export interface DescriptionEditorProps {
  data: DescriptionData;
  onChange: (content: string) => void;
}

// 상품등록 - 기본 정보
export interface BasicInfoData {
  parentCategoryId: string;
  categoryId: string;
  name: string;
  brand: string;
  origin: string;
  status: ProductStatus;
}
export interface BasicInfoFieldProps {
  data: BasicInfoData;
  categories: CategoryNode[];
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

export interface SortableImageProps {
  image: ProductImageItem;
  index: number;
  onRemove: (id: string) => void;
  onMoveFirst: (id: string) => void;
}



//반품정책
export interface ReturnPolicyData {
  content: string;
}

export interface FormActionButtonsProps {
  mode: ProductFormMode;
  onSubmit: () => void;
}

export type ProductFormMode = 'create' | 'edit';

export interface ProductFormProps {
  mode: ProductFormMode;
  initialData?: ProductFormData;
}

//  상품등록 - 전체 폼 데이터
export interface ProductFormData {
  basicInfo: BasicInfoData;
  pricingInfo: PricingData;
  images: ImageUploadData;
  description: DescriptionData;
  shippingTemplateId: number | null;
  returnPolicyTemplateId: number | null;
}

export const initialProductForm: ProductFormData = {
  // 기본 정보
  basicInfo: {
    parentCategoryId: '',
    categoryId: '',
    name: '',
    brand: '',
    origin: '',
    status: '판매중',
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
  images: {
    images: [],
  },
  description: {
    content: '',
  },
  //배송 정보
  shippingTemplateId: null,

  //반품정책
  returnPolicyTemplateId: null,
};

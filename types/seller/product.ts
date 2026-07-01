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
  rating: number;
  reviewCount: number;
}

export type ProductData = Omit<Product, 'id' | 'linkedRecipeCount' | 'createdAt'>;

// 상품 이미지
export interface ProductImageItem {
  id: string;
  imageId?: number;
  preview: string;
  file?: File;
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
  productId?: number;
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

export interface CreateProductInput {
  sellerId: number;
  name: string;
  brand: string;
  origin: string;
  categoryId: number;
  status: string;
  price: number;
  stock: number;
  description: string;
  shippingTemplateId: number | null;
  returnPolicyTemplateId: number | null;
  discountType: string;
  discountValue: number | null;
}
export interface UpdateProductInput {
  sellerId: number;
  productId: number;
  name: string;
  brand: string;
  origin: string;
  categoryId: number;
  status: string;
  price: number;
  stock: number;
  description: string;
  shippingTemplateId: number | null;
  returnPolicyTemplateId: number | null;
  discountType: string;
  discountValue: number | null;
}

export interface SubImageInput {
  imageId?: number;
  file?: File;
}

export type ProductSortBy = 'price' | 'stock';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  keyword?: string;
  status?: string;
  categoryId?: number;
  parentId?: number;
  page: number;
  limit: number;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
}

export interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  pageSize?: number;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy: ProductSortBy) => void;
  selectedIds: number[];
  isAllSelectedMode: boolean;
  onSelect: (productId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onStatusChanged?: () => void;
}

export interface BulkDeleteResult {
  successCount: number;
  failures: { productId: number; reason: string }[];
}

export interface ProductCounts {
  전체: number;
  판매중: number;
  품절: number;
  판매종료: number;
  숨김: number;
}

export interface LowStockProduct {
  productId: number;
  name: string;
  stock: number;
  minStock: number;
}

export interface ProductExportRow {
  productId: number;
  name: string;
  parentCategoryName: string;
  categoryName: string;
  brand: string;
  origin: string;
  price: number;
  stock: number | null;
  discountType: string;
  discountValue: number | null;
  status: ProductStatus | null;
  shippingTemplateName: string;
  returnPolicyTemplateName: string;
  linkedRecipeCount: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  createdAt: string;
}


interface BulkImportRow {
  name: string;
  parentCategoryName: string;
  categoryName: string;
  brand: string;
  origin: string;
  price: number;
  stock: number;
  discountType: string;
  discountValue: number | null;
  status: string;
  shippingTemplateName: string;
  returnPolicyTemplateName: string;
  description: string;
  image: string;
}

export async function bulkImportSellerProducts(sellerId: number, rows: BulkImportRow[]) {
  // 1. 이름 → ID 매핑용 참조 데이터 미리 조회
  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('category_id, name, parent_id, ingredients(category)');

  const { data: shippingTemplates } = await supabaseAdmin
    .from('shipping_templates')
    .select('template_id, name')
    .eq('seller_id', sellerId);

  const { data: returnPolicyTemplates } = await supabaseAdmin
    .from('return_policy_templates')
    .select('template_id, name')
    .eq('seller_id', sellerId);

  // "대카테고리명|소카테고리명" 조합으로 category_id 찾기
  const categoryMap = new Map<string, number>();
  for (const c of allCategories ?? []) {
    const parentName = (c.ingredients as unknown as { category: string } | null)?.category ?? '';
    categoryMap.set(`${parentName}|${c.name}`, c.category_id);
  }

  const shippingMap = new Map((shippingTemplates ?? []).map((t) => [t.name, t.template_id]));
  const returnPolicyMap = new Map((returnPolicyTemplates ?? []).map((t) => [t.name, t.template_id]));

  let successCount = 0;
  const failures: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.name || !row.price || !row.stock || !row.origin || !row.image) {
      failures.push({ row: i + 1, reason: '필수 항목이 누락되었습니다. (상품명/가격/재고/원산지/대표이미지URL)' });
      continue;
    }

    const categoryId = categoryMap.get(`${row.parentCategoryName}|${row.categoryName}`);
    if (!categoryId) {
      failures.push({ row: i + 1, reason: `카테고리를 찾을 수 없습니다. (${row.parentCategoryName} > ${row.categoryName})` });
      continue;
    }

    const shippingTemplateId = shippingMap.get(row.shippingTemplateName);
    if (!shippingTemplateId) {
      failures.push({ row: i + 1, reason: `배송템플릿 '${row.shippingTemplateName}'을 찾을 수 없습니다.` });
      continue;
    }

    const returnPolicyTemplateId = returnPolicyMap.get(row.returnPolicyTemplateName);
    if (!returnPolicyTemplateId) {
      failures.push({ row: i + 1, reason: `반품정책 '${row.returnPolicyTemplateName}'을 찾을 수 없습니다.` });
      continue;
    }

    const { error } = await supabaseAdmin.from('products').insert({
      seller_id: sellerId,
      name: row.name,
      brand: row.brand || null,
      origin: row.origin,
      category_id: categoryId,
      status: resolveProductStatus(row.status || '판매중', row.stock),
      price: row.price,
      stock: row.stock,
      description: row.description || null,
      shipping_template_id: shippingTemplateId,
      return_policy_template_id: returnPolicyTemplateId,
      discount_type: row.discountType || 'none',
      discount_value: row.discountValue ?? null,
      image: row.image,
    });

    if (error) {
      failures.push({ row: i + 1, reason: error.message });
      continue;
    }

    successCount += 1;
  }

  return { successCount, failures };
}
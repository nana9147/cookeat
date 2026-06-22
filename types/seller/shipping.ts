export type ShippingStatus = '배송준비중' | '배송중' | '배송완료';
export type ShippingFeeType = '무료' | '유료' | '조건부 무료';
export type AddressType = '출고지' | '반품지';
export type AddressBadgeType = '기본출고지' | '기본반품지';
export type FormType = '등록' | '수정';
export type CourierCode =
  | 'CJ대한통운'
  | '로젠택배'
  | '한진택배'
  | '롯데택배'
  | '우체국택배'
  | 'CU 편의점택배'
  | 'GS25 편의점택배'
  | 'ETC';
export type NonReturnReason =
  | '신선식품 단순변심 반품불가'
  | '포장 개봉/사용 후'
  | '소비기한 경과'
  | '보관방법 미준수로 인한 손상/변질'
  | '주문제작(정육손질/소분 등)';

export interface ShippingData {
  shippingFeeType: ShippingFeeType;
  shippingFee: string;
  freeThreshold: string;
  returnFee: string;
  originAddress: string;
  returnAddress: string;
}
export interface ShippingSectionProps {
  templates: ShippingTemplateOption[];
  value: number | null;
  onChange: (templateId: number | null) => void;
}

export interface ShippingOrder {
  id: string; // 주문번호
  customer: string; // 주문자
  products: string[]; // 상품명
  orderDate: string; // 주문일시
  status: ShippingStatus;
  courier: CourierCode | ''; // 택배사
  trackingNumber: string; // 운송장 번호
}

export interface ShippingStatusCardsProps {
  cards: { label: string; count: number; filterValue: string }[];
  status: ShippingStatus | '전체';
  onStatusChange: (value: ShippingStatus | '전체') => void;
}

export interface ShippingTableProps {
  orders: ShippingOrder[];
  search: string;
  onSearchChange: (value: string) => void;
  onUpdate: (orderId: string, courier: string, trackingNumber: string) => void;
}

/** 배송 템플릿  */
export interface ShippingTemplateOption {
  templateId: number;
  name: string;
  feeType: ShippingFeeType;
  fee: number;
  freeThreshold: number | null;
  returnFee: number;
  originAddress: string;
  returnAddress: string;
  isDefault: boolean;
}

export interface ShippingTemplate {
  templateId: number;
  name: string;
  feeType: ShippingFeeType;
  fee: number;
  freeThreshold: number;
  returnFee: number;
  originAddress: string;
  returnAddress: string;
  isDefault: boolean;
}

export interface ShippingTemplateFormProps {
  mode: FormType;
  template?: ShippingTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<ShippingTemplate, 'templateId'>) => void;
}
export interface ShippingTemplateTableProps {
  shippings: ShippingTemplate[];
  onEdit: (shipping: ShippingTemplate) => void;
  onDelete: (templateId: number) => void;
  onSetDefault: (templateId: number) => void;
}

export interface AddressItem {
  id: string;
  name: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
  type: AddressType;
  isDefault: boolean;
}

export interface AddressCardProps {
  address: AddressItem;
  onEdit: () => void;
  onDelete: () => void;
}

export interface AddressFormProps {
  mode: FormType;
  address?: AddressItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<AddressItem, 'id'>) => void;
}

/* 반품 템플릿 */
export interface ReturnPolicyTemplateOption {
  templateId: number;
  name: string;
  returnPeriod: number;
  refundPeriod: number;
  nonReturnReasons: NonReturnReason[];
  isDefault: boolean;
}

export interface ReturnPolicyContent {
  returnPeriod: number; // 반품 가능 기간 (일)
  defectShippingPayer: '판매자'; // 판매자 귀책 배송비 부담 (항상 판매자)
  nonReturnReasons: NonReturnReason[]; // 반품 불가 사유
  refundPeriod: number; // 환불 처리 기간 (일)
}

export interface ReturnPolicy {
  returnId: number;
  name: string;
  content: ReturnPolicyContent;
  isDefault: boolean;
}

export interface ReturnPolicyFormProps {
  mode: FormType;
  policy?: ReturnPolicy;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<ReturnPolicy, 'returnId'>) => void;
}

export interface ReturnPolicyFieldProps {
  templates: ReturnPolicyTemplateOption[];
  value: number | null;
  onChange: (templateId: number | null) => void;
}

export interface ReturnPolicyTableProps {
  policies: ReturnPolicy[];
  onEdit: (policy: ReturnPolicy) => void;
  onDelete: (returnId: number) => void;
  onSetDefault: (returnId: number) => void;
}

export interface CreateShippingTemplateInput {
  sellerId: number;
  name: string;
  feeType: ShippingFeeType;
  fee: number;
  freeThreshold: number | null;
  returnFee: number;
  originAddress: string;
  returnAddress: string;
  isDefault: boolean;
}

export interface UpdateShippingTemplateInput {
  sellerId: number;
  templateId: number;
  name: string;
  feeType: ShippingFeeType;
  fee: number;
  freeThreshold: number | null;
  returnFee: number;
  originAddress: string;
  returnAddress: string;
}
export interface SetDefaultShippingTemplateInput {
  sellerId: number;
  templateId: number;
}

export interface CreateReturnPolicyTemplateInput {
  sellerId: number;
  name: string;
  returnPeriod: number;
  refundPeriod: number;
  nonReturnReasons: NonReturnReason[];
  isDefault: boolean;
}

export interface UpdateReturnPolicyTemplateInput {
  sellerId: number;
  templateId: number;
  name: string;
  returnPeriod: number;
  refundPeriod: number;
  nonReturnReasons: NonReturnReason[];
}

export interface SetDefaultReturnPolicyTemplateInput {
  sellerId: number;
  templateId: number;
}

export type ShippingStatus = '배송준비중' | '배송중' | '배송완료';
export type ShippingFeeType = '무료' | '유료' | '조건부 무료';
export type AddressType = '출고지' | '반품지';
export type AddressBadgeType = '기본출고지' | '기본반품지';
export type AddressFormType = '등록' | '수정';
export type CourierCode =
  | 'CJ대한통운'
  | '로젠택배'
  | '한진택배'
  | '롯데택배'
  | '우체국택배'
  | 'CU 편의점택배'
  | 'GS25 편의점택배'
  | 'ETC';

export interface AddressItem {
  id: string;
  name: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
  type: AddressType;
  isDefault: boolean;
}

export interface ShippingFeeItem {
  id: string;
  name: string;
  type: ShippingFeeType;
  fee: number;
  freeThreshold?: number; //조건부 무배 기준 금액
}

export interface ShippingData {
  shippingFeeType: ShippingFeeType;
  shippingFee: string;
  freeThreshold: string;
  returnFee: string;
  originAddress: string;
  returnAddress: string;
}
export interface ShippingSectionProps {
  data: ShippingData;
  onChange: (field: keyof ShippingData, value: string) => void;
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

export interface AddressItemWithType extends AddressItem {
  type: AddressType;
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

export interface AddressCardProps {
  address: AddressItem;
  onEdit: () => void;
  onDelete: () => void;
}

export interface AddressFormProps {
  mode: AddressFormType;
  address?: AddressItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<AddressItem, 'id'>) => void;
}

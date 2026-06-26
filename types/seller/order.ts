import type { DateRangeFilterProps } from './common';

export type OrderStatus =
  | '결제완료'
  | '배송준비'
  | '배송중'
  | '배송완료'
  | '취소'
  | '환불'
  | '환불요청';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  결제완료: '신규주문',
  배송준비: '배송준비중',
  배송중: '배송중',
  배송완료: '배송완료',
  취소: '취소',
  환불: '환불',
  환불요청: '환불요청',
};

export type PaymentMethod = 'card' | 'kakao' | 'toss' | 'bankbook' | 'mobile';
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: '신용카드',
  kakao: '카카오페이',
  toss: '토스페이',
  bankbook: '무통장입금',
  mobile: '휴대폰결제',
};

export type OrderStatusFilter = OrderStatus | '전체' | '취소환불';

export type OrderSortBy = 'orderDate' | 'orderId';
export type SortOrder = 'asc' | 'desc';

//  주문 내역 목록
export interface Order {
  id: string;
  customer: string;
  recipient: string;
  phone: string;
  product: string;
  price: number;
  status: OrderStatus;
  orderDate: string;
}

export interface OrderTableProps {
  orders: SellerOrderRow[];
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: OrderSortBy) => void;
  selectedIds: number[];
  isAllSelectedMode: boolean;
  onSelect: (itemId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SellerOrderRow {
  orderId: string;
  orderDate: string;
  customer: string;
  recipient: string;
  phone: string;
  itemId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  status: OrderStatus;
}
export interface OrderExportRow {
  id: string;
  orderDate: string;
  customer: string;
  recipient: string;
  phone: string;
  address: string;
  addressDetail: string;
  productName: string;
  shippingRequest: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  shippingFee: number;
  couponDiscount: number;
  pointAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface OrderPageFilterProps extends DateRangeFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}
// 주문 상세 내역 - 기본 정보
export interface OrderInfo {
  id: string;
  orderDate: string;
  status: OrderStatus;
}

export interface OrderInfoSectionProps {
  info: OrderInfo;
  name: string;
}

// 주문 상세 내역 - 개별 상품 정보
export interface OrderProduct {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  img: string;
  itemStatus: '환불요청' | '환불' | null;
  refundRequestReason: string | null;
  refundRejectReason: string | null;
}

// 주문 상세 내역 - 결제 정보
export interface PaymentInfo {
  totalPrice: number; // 전체 상품금액
  shippingFee: number; // 배송비
  couponCode: string | null; // 사용된 쿠폰 코드
  couponDiscountType: 'rate' | 'fixed' | null; // 정률/정액
  couponDiscountValue: number | null; // 할인 값 (rate면 %, fixed면 원)
  couponDiscount: number; // 사용 쿠폰금액
  pointAmount: number; // 사용 포인트
  finalAmount: number; // 최종 결제 금액
  paymentMethod: PaymentMethod; // 결제 수단
}
export const COUPON_DISCOUNT_TYPE_LABEL: Record<'rate' | 'fixed', string> = {
  rate: '%',
  fixed: '원',
};

// 주문 상세 내역 - 배송 정보
export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  memo: string;
}

export interface OrderDetail {
  info: OrderInfo;
  products: OrderProduct[];
  payment: PaymentInfo;
  delivery: DeliveryInfo;
}

// 주문 상태 카드
export interface StatusCardItem {
  label: string;
  count: number;
  filterValue: string;
}

export interface OrderStatusCardsProps {
  cards: StatusCardItem[];
  status: OrderStatusFilter;
  onStatusChange: (value: OrderStatusFilter) => void;
}

// 주문 필터
export interface OrderSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: OrderStatusFilter;
  onStatusChange: (value: OrderStatusFilter) => void;
  statuses: (OrderStatus | '전체')[];
}

export interface OrderProductItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

//환불
export interface RefundItem {
  itemId: number;
  refundId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemStatus: '환불요청' | '환불';
  refundRequestReason: string | null;
  refundRejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface OrderWithRefunds {
  id: string;
  orderDate: string;
  orderStatus: OrderStatus;
  customer: string;
  recipient: string;
  phone: string;
  refundItems: RefundItem[];
}

export interface RefundTableProps {
  orders: OrderWithRefunds[];
  onApprove: (refundId: number) => void;
  onReject: (refundId: number) => void;
  selectedIds: number[];
  isAllSelectedMode: boolean;
  onSelect: (refundId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface RefundExportRow {
  orderId: string;
  customer: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  status: '환불요청' | '환불' | '거부됨';
  requestReason: string | null;
  rejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface OrderRow {
  orderId: string;
  orderDate: string;
  customer: string;
  recipient: string;
  phone: string;
  itemId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  status: OrderStatus;
}

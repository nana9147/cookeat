import type { DateRangeFilterProps } from './common';

export type OrderStatus =
  | '결제완료'
  | '배송준비'
  | '배송중'
  | '배송완료'
  | '취소'
  | '취소요청'
  | '취소거부'
  | '환불'
  | '환불요청'
  | '환불진행중'
  | '환불거부'
  | '구매확정';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  결제완료: '신규주문',
  배송준비: '배송준비중',
  배송중: '배송중',
  배송완료: '배송완료',
  취소: '취소완료',
  취소요청: '취소요청',
  취소거부: '취소거부',
  환불: '환불완료',
  환불요청: '환불요청',
  환불진행중: '환불진행중',
  환불거부: '환불거부',
  구매확정: '구매확정',
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
  hasActiveClaim: boolean;
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
  unitPrice: number; // [할인 적용 단가] originalUnitPrice - (productDiscount / quantity) (예: 18,800원)
  originalUnitPrice: number; // [기본 단가] UI의 '단가'에 해당 (예: 23,800원)
  productDiscount: number; // [상품할인] 단가에서 할인된 총액 (예: 5,000원)
  couponDiscount: number; // [쿠폰할인] 해당 상품에 분배된 쿠폰 할인액 (예: 1,880원)
  itemTotalPrice: number; // [결제금액] UI의 개별 상품 '결제금액' 항목
  img: string;
  itemStatus: '환불요청' | '환불진행중' | '환불' | '취소요청' | '취소' | null;
  refundRequestReason: string | null;
  refundRejectReason: string | null;
}

// 주문 상세 내역 - 결제 정보
export interface PaymentInfo {
  totalPrice: number; //단가의 총합
  shippingFee: number; // 배송비
  couponCode: string | null; // 사용된 쿠폰 코드
  couponDiscountType: 'rate' | 'fixed' | null; // 정률/정액
  couponDiscountValue: number | null; // 할인 값 (rate면 %, fixed면 원)
  couponDiscount: number; // 전체 쿠폰 할인 총합
  productDiscount: number; // 전체 상품할인 총합
  pointAmount: number; // 사용 포인트
  finalAmount: number; // 최종 결제 금액 총
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
  img: string | null;
  quantity: number;
  unitPrice: number; // 할인 적용 후 단가
  originalUnitPrice: number; // 할인 전 정상 단가
  productDiscount: number; // 상품할인 총액
  couponDiscount: number; // 이 상품에 분배된 쿠폰할인액
  allocatedPoint: number; // 이 상품에 사용된 포인트
  refundAmount: number; // 결제수단으로 환급되는 금액 (수량*단가 - 쿠폰할인)
  itemStatus: OrderStatus;
  refundRequestReason: string | null;
  refundRejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
  returnCourier: string | null;
  returnTrackingNumber: string | null;
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

export interface SellerOrderRpcRow {
  item_id: number;
  order_id: string;
  quantity: number;
  unit_price: number;
  product_name: string | null;
  order_date: string;
  status: string;
  recipient: string;
  phone: string;
  nickname: string | null;
  total_count: number;
}

export interface OrderProductSectionProps {
  products: OrderProduct[];
  refundTotal: number;
}

export type OrderStatus =
  | '결제완료'
  | '주문확인'
  | '배송준비'
  | '배송중'
  | '배송완료'
  | '취소'
  | '환불';
export type PaymentMethod = '신용카드' | '실시간 계좌이체' | '간편결제' | '휴대폰 소액결제';

export type OrderStatusFilter = OrderStatus | '전체' | '취소환불';

//  주문 내역 목록
export interface Order {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: OrderStatus;
  orderDate: string;
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
}

// 주문 상세 내역 - 결제 정보
export interface PaymentInfo {
  totalPrice: number; // 전체 상품금액
  shippingFee: number; // 배송비
  couponType: string; // 쿠폰 종류
  couponAmount: number; // 사용 쿠폰금액
  pointAmount: number; // 사용 포인트
  finalAmount: number; // 최종 결제 금액
  paymentMethod: PaymentMethod; // 결제 수단
}

// 주문 상세 내역 - 배송 정보
export interface DeliveryInfo {
  name: string;
  phone: string;
  address: {
    originAddress: string;
    detailAddress: string;
  };
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

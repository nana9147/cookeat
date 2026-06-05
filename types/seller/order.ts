export type OrderStatus = '배송준비중' | '결제완료' | '배송중' | '배송완료';

export interface Order {
  id: string;
  customer: string;
  product: string;
  price: string;
  status: OrderStatus;
}

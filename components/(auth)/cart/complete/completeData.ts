export type PaymentType = 'card' | 'kakao' | 'toss' | 'bankbook' | 'mobile';

export const PAYMENT_LABEL: Record<PaymentType, string> = {
  card: '신용카드 (신한카드)',
  kakao: '카카오페이',
  toss: '토스페이',
  bankbook: '무통장입금',
  mobile: '휴대폰결제',
};

export const DELIVERY = {
  label: '우리집',
  name: '김○주',
  phone: '010-1234-5678',
  address: '서울시 강남구 테헤란로 123 456호',
};

export const ORDER_INFO = {
  orderId: 'ORD-20240529012234',
  date: '2024년 5월 29일 14:23',
};

export const ITEMS = [
  { id: 1, seller: '상호', name: '그릴 버터 파스타', quantity: 1, price: 17350 },
  { id: 2, seller: '상호', name: '김치찌개', quantity: 1, price: 14600 },
  { id: 3, seller: '상호', name: '홍합버터감자탕 1/4', quantity: 1, price: 7960 },
];

const PRODUCT_TOTAL = 39930;
const PRODUCT_DISCOUNT = 1520;
const COUPON_DISCOUNT = 3000;
const SHIPPING_FEE = 0;
export const FINAL_AMOUNT = PRODUCT_TOTAL - PRODUCT_DISCOUNT - COUPON_DISCOUNT + SHIPPING_FEE;

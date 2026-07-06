// 1:1 문의 카테고리 정의. 응대 주체는 카테고리 이름이 아니라 product_id/order_item_id 연결 여부로 결정된다.
// 연결값이 있는 문의(상품 상세·주문 상세에서 등록)는 전부 판매자 응대 대상이라 상품/주문 구분 없이 같은
// 카테고리 셋을 쓴다. 연결값이 없는 일반 문의는 관리자 응대 대상.
export const GENERAL_CATEGORIES = ['계정문의', '레시피문의', '포인트문의', '기타'] as const;
export const SELLER_CATEGORIES = ['배송문의', '주문문의', '기타'] as const;
export const VALID_CATEGORIES = [
  ...new Set<string>([...GENERAL_CATEGORIES, ...SELLER_CATEGORIES]),
];

// 1:1 문의 카테고리 정의. 상품/주문 연결 문의(판매자 응대)는 다음 PR에서 추가된다.
export const GENERAL_CATEGORIES = ['계정문의', '레시피문의', '포인트문의', '기타'] as const;
export const VALID_CATEGORIES: string[] = [...GENERAL_CATEGORIES];

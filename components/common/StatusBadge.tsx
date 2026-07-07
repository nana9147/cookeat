const styles = {
  // 상품 상태
  판매대기: 'bg-blue-100 text-blue-700',
  판매중: 'bg-green-100 text-green-700',
  품절: 'bg-red-100 text-red-600',
  판매종료: 'bg-gray-100 text-gray-500',
  판매중지: 'bg-red-100 text-red-600',
  숨김: 'bg-gray-100 text-gray-500',

  // 주문 상태
  결제전: 'bg-gray-50 text-gray-500 border border-gray-200',
  결제완료: 'bg-emerald-50 text-primary border border-emerald-200',
  주문확인: 'bg-purple-50 text-primary border border-purple-200',
  배송준비중: 'bg-amber-50 text-yellow border border-amber-200',
  배송준비: 'bg-amber-50 text-yellow border border-amber-200',
  배송중: 'bg-blue-50 text-blue-600 border border-blue-200',
  배송완료: 'bg-beige text-muted border border-border',
  구매확정: 'bg-green-50 text-green-700 border border-green-200',
  취소: 'bg-slate-50 text-slate-500 border border-slate-200',
  환불: 'bg-red-50 text-red-600 border border-red-200',

  // 배송지 유형
  기본출고지: 'bg-violet-50 text-violet-600 border border-violet-200',
  기본반품지: 'bg-cyan-50 text-cyan-600 border border-cyan-200',

  // 배송비 유형
  무료: 'bg-green-100 text-green-700',
  유료: 'bg-amber-100 text-amber-700',
  '조건부 무료': 'bg-blue-100 text-blue-700',

  // 어드민 회원 등급
  일반: 'bg-beige text-dark-text',
  VIP: 'bg-amber-100 text-amber-700',

  // 어드민 회원 상태
  정상: 'bg-green-100 text-green-700',
  정지: 'bg-red-100 text-red-600',

  // 어드민 판매자 상태
  승인: 'bg-emerald-50 text-primary border border-emerald-200',
  거절: 'bg-red-50 text-red-600 border border-red-200',
  대기: 'bg-amber-50 text-yellow border border-amber-200',

  // 어드민 정산 상태
  정산대기: 'bg-amber-50 text-yellow border border-amber-200',
  정산완료: 'bg-emerald-50 text-primary border border-emerald-200',

  // 어드민 콘텐츠 공개 상태
  공개: 'bg-green-100 text-green-700',
  비공개: 'bg-gray-100 text-gray-500',

  // 어드민 리뷰/신고 상태
  신고: 'bg-red-100 text-red-600',
  처리완료: 'bg-gray-100 text-gray-500',

  // 어드민 문의 상태
  답변대기: 'bg-amber-50 text-yellow border border-amber-200',
  처리중: 'bg-blue-50 text-blue-600 border border-blue-200',
  답변완료: 'bg-emerald-50 text-primary border border-emerald-200',

  // 어드민 문의 카테고리
  배송: 'bg-blue-100 text-blue-700',
  상품: 'bg-green-100 text-green-700',
  기타: 'bg-gray-100 text-gray-500',
  회원: 'bg-amber-100 text-amber-700',
  결제: 'bg-purple-100 text-purple-700',
} as const;

export type StatusBadgeStatus = keyof typeof styles;

export default function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}

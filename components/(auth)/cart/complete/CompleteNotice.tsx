const NOTICES = [
  '주문 내역 및 배송 정보는 마이페이지 > 주문내역/배송조회에서 확인하실 수 있습니다.',
  '신선식품의 특성상 단순 변심에 따른 교환/환불이 제한될 수 있습니다.',
  '판매자와의 특약에 의해 이 상품들의 반품 규정이 달라질 수 있습니다.',
  '배송 전 연락이 필요한 경우 고객서비스 1588-1234로 연락주세요.',
];

export default function CompleteNotice() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-h4 font-bold text-dark-text mb-3">안내사항</h3>
      <ul className="flex flex-col gap-1.5 text-xs text-gray-text">
        {NOTICES.map((text) => (
          <li key={text}>• {text}</li>
        ))}
      </ul>
    </div>
  );
}

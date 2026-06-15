const SELLERS = [
  { name: '쿠킨직영', condition: '무료 (3만원 이상)' },
  { name: '신산마켓', condition: '무료 (3만원 이상)' },
  { name: '농장직송', condition: '무료 (3만원 이상)' },
  { name: '치즈마켓', condition: '무료 (2만원 이상)' },
  { name: '종가김마켓', condition: '무료 (3만원 이상)' },
  { name: '정육마켓', condition: '무료 (5만원 이상)' },
  { name: '해산물마켓', condition: '무료 (5만원 이상)' },
];

export default function SellerInfo() {
  return (
    <div className="bg-hover rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <svg
          className="w-3.5 h-3.5 text-primary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs font-semibold text-dark-text">판매자별 배송 안내</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {SELLERS.map((seller) => (
          <div key={seller.name} className="flex justify-between">
            <span className="text-xs text-gray-text">{seller.name}</span>
            <span className="text-xs text-gray-text">{seller.condition}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SIMILAR_ITEMS = [
  { id: 1, name: '대파 1단', price: 1500 },
  { id: 2, name: '정정원 진간장 500ml', price: 3680 },
  { id: 3, name: '유기농 무유 900ml', price: 3200 },
  { id: 4, name: '진란경 새송이버섯 300g', price: 2980 },
];

export default function RecommendedItems() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h5 font-bold text-dark-text">
          <span className="border-l-4 border-primary pl-2">함께 사면 좋아요</span>
        </h3>
        <button className="text-sm text-gray-text hover:text-dark-text">더보기</button>
      </div>
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
        {SIMILAR_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
          >
            <div className="aspect-square bg-card-bg relative flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <button className="absolute bottom-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white shadow">
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
            <div className="p-2">
              <p className="text-xs text-dark-text font-medium truncate">{item.name}</p>
              <p className="text-xs font-bold text-dark-text mt-0.5">{item.price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

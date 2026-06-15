const MOCK_ITEMS = [
  { id: 1, seller: '상호', name: '그릴 버터 파스타', quantity: 1, price: 17500 },
  { id: 2, seller: '상호', name: '김치찌개', quantity: 1, price: 14900 },
  { id: 3, seller: '상호', name: '홍합버터감자탕 1/4', quantity: 1, price: 7960 },
];

export default function OrderItems() {
  return (
    <section className="py-6 border-b border-border">
      <h3 className="text-h4 font-bold text-dark-text mb-4">
        주문 상품{' '}
        <span className="text-sm font-normal text-gray-text">{MOCK_ITEMS.length}개</span>
      </h3>

      <div className="flex flex-col gap-4">
        {MOCK_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-15 h-15 desktop:w-18 desktop:h-18 rounded-lg bg-card-bg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-text mb-0.5">{item.seller}</p>
              <p className="text-sm font-medium text-dark-text truncate">{item.name}</p>
              <p className="text-xs text-light-gray">{item.quantity}개</p>
            </div>
            <span className="text-sm font-semibold text-dark-text shrink-0">
              {item.price.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

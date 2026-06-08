import CircleCheckbox from './CircleCheckbox';
import type { CartItem } from './cartData';

function TagBadge({ tag }: { tag: string }) {
  if (tag === '세벽배송') return <span className="text-xs text-primary">세벽배송</span>;
  return <span className="text-xs font-bold text-red">{tag}</span>;
}

const qtyBtn = 'w-6 h-6 rounded border border-border flex items-center justify-center text-gray-text hover:bg-hover text-sm';

export default function CartItemRow({ item }: { item: CartItem }) {
  return (
    <div className={`flex items-start gap-2 tablet:gap-3 py-4 ${!item.checked ? 'opacity-50' : ''}`}>
      <CircleCheckbox checked={item.checked} className="mt-1" />

      <div className="w-12 h-12 tablet:w-14 tablet:h-14 rounded-lg bg-card-bg shrink-0 flex items-center justify-center">
        <svg className="w-5 h-5 tablet:w-6 tablet:h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-light-gray mb-0.5 truncate">{item.origin}</p>
        <p className="text-sm font-medium text-dark-text leading-snug">{item.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          {item.badgeDiscount && <span className="text-xs font-medium text-red">{item.badgeDiscount}</span>}
        </div>

        {/* 모바일: 수량·가격을 정보 아래에 표시 */}
        <div className="flex items-center justify-between mt-2 tablet:hidden">
          <div className="flex items-center gap-1">
            <button className={qtyBtn}>-</button>
            <span className="w-6 text-center text-sm text-dark-text">{item.qty}</span>
            <button className={qtyBtn}>+</button>
          </div>
          <p className="text-sm font-medium text-dark-text">{item.price.toLocaleString()}원</p>
        </div>
      </div>

      {/* 태블릿+: 수량·가격 인라인 */}
      <div className="hidden tablet:flex items-center gap-1 shrink-0">
        <button className={qtyBtn}>-</button>
        <span className="w-6 text-center text-sm text-dark-text">{item.qty}</span>
        <button className={qtyBtn}>+</button>
      </div>
      <p className="hidden tablet:block text-sm font-medium text-dark-text shrink-0 w-16 text-right">
        {item.price.toLocaleString()}원
      </p>

      <button className="text-muted hover:text-gray-text shrink-0 text-base leading-none">×</button>
    </div>
  );
}

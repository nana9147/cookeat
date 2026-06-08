import CartItemRow from './CartItemRow';
import type { RecipeGroup } from './cartData';

export default function RecipeGroupCard({ group }: { group: RecipeGroup }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-text bg-beige px-2 py-0.5 rounded-full">레시피 묶음</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow inline-block" />
              <span className="text-xs text-gray-text">{group.seller}</span>
              <span className="text-xs text-yellow">★</span>
              <span className="text-xs text-gray-text">4.8</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-dark-text">{group.recipeName} · {group.servings}인분</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="text-xs px-3 py-1.5 border border-border rounded-lg text-gray-text hover:bg-hover whitespace-nowrap">인분 변경</button>
          <button className="text-xs px-3 py-1.5 border border-red/30 rounded-lg text-red hover:bg-red/5 whitespace-nowrap">품목 삭제</button>
        </div>
      </div>
      <div className="px-5 divide-y divide-border">
        {group.items.map((item) => <CartItemRow key={item.id} item={item} />)}
      </div>
      <div className="flex items-center justify-between px-5 py-3 bg-hover border-t border-border">
        <span className="text-xs text-gray-text">{group.discountCount}개재료 · {group.discountAmount.toLocaleString()}원 할인 적용</span>
        <span className="text-sm font-bold text-dark-text">{group.total.toLocaleString()}원</span>
      </div>
    </div>
  );
}

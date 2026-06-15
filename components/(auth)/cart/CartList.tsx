import RecipeGroupCard from './RecipeGroupCard';
import CartItemRow from './CartItemRow';
import type { RecipeGroup, CartItem } from './cartData';

type Props = {
  groups: RecipeGroup[];
  individuals: CartItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export default function CartList({ groups, individuals, selectedIds, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <RecipeGroupCard key={group.id} group={group} selectedIds={selectedIds} onToggle={onToggle} />
      ))}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 tablet:px-5 py-4 border-b border-border">
          <svg className="w-4 h-4 text-gray-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-semibold text-dark-text">개별 담은 재료</span>
          <span className="text-xs text-gray-text">{individuals.length}개 상품</span>
        </div>
        <div className="px-4 tablet:px-5 divide-y divide-border">
          {individuals.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              checked={selectedIds.includes(item.id)}
              onToggle={() => onToggle(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import CartList from './CartList';
import CircleCheckbox from './CircleCheckbox';
import type { MergedCartItem } from './useCartItems';

type Props = {
  items: MergedCartItem[];
  loading: boolean;
  error: boolean;
  selectedIds: number[];
  allSelected: boolean;
  onToggleAll: () => void;
  onToggle: (id: number) => void;
  onQtyChange: (productId: number, qty: number) => void;
  onDelete: (productId: number) => void;
  onDeleteSelected: () => void;
};

export default function Cart({
  items,
  loading,
  error,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggle,
  onQtyChange,
  onDelete,
  onDeleteSelected,
}: Props) {
  if (error && items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl px-4 py-12 text-center">
        <p className="text-gray-text text-sm">장바구니를 불러오는 데 실패했습니다. 새로고침 해주세요.</p>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl px-4 py-12 text-center">
        <p className="text-gray-text text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-border rounded-xl px-4 tablet:px-5 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CircleCheckbox checked={allSelected} onChange={onToggleAll} />
          <span
            className="text-sm font-medium text-dark-text cursor-pointer truncate"
            onClick={onToggleAll}
          >
            전체 선택 ({selectedIds.length}/{items.length})
          </span>
        </div>
        <div className="flex items-center gap-2 tablet:gap-4 text-xs tablet:text-sm text-gray-text shrink-0">
          <button onClick={onDeleteSelected} className="hover:text-dark-text whitespace-nowrap">
            선택 삭제
          </button>
        </div>
      </div>

      <CartList
        items={items}
        selectedIds={selectedIds}
        onToggle={onToggle}
        onQtyChange={onQtyChange}
        onDelete={onDelete}
      />
    </div>
  );
}

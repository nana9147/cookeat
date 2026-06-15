'use client';

import { useState, useMemo } from 'react';
import CartList from './CartList';
import RecommendedItems from './RecommendedItems';
import CircleCheckbox from './CircleCheckbox';
import { RECIPE_GROUPS, INDIVIDUAL_ITEMS, type RecipeGroup, type CartItem } from './cartData';

export default function Cart() {
  const [groups, setGroups] = useState<RecipeGroup[]>(RECIPE_GROUPS);
  const [individuals, setIndividuals] = useState<CartItem[]>(INDIVIDUAL_ITEMS);

  const allItems = useMemo(
    () => [...groups.flatMap((g) => g.items), ...individuals],
    [groups, individuals],
  );
  const allIds = useMemo(() => allItems.map((i) => i.id), [allItems]);

  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    [...RECIPE_GROUPS.flatMap((g) => g.items), ...INDIVIDUAL_ITEMS]
      .filter((i) => i.checked)
      .map((i) => i.id),
  );

  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;

  const toggleAll = () => setSelectedIds(allSelected ? [] : allIds);

  const toggleItem = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const deleteSelected = () => {
    setGroups((prev) =>
      prev
        .map((g) => ({ ...g, items: g.items.filter((i) => !selectedIds.includes(i.id)) }))
        .filter((g) => g.items.length > 0),
    );
    setIndividuals((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    setSelectedIds([]);
  };

  const deleteOutOfStock = () => {
    const outOfStockIds = allItems.filter((i) => i.qty === 0).map((i) => i.id);
    setGroups((prev) =>
      prev
        .map((g) => ({ ...g, items: g.items.filter((i) => i.qty > 0) }))
        .filter((g) => g.items.length > 0),
    );
    setIndividuals((prev) => prev.filter((i) => i.qty > 0));
    setSelectedIds((prev) => prev.filter((id) => !outOfStockIds.includes(id)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-border rounded-xl px-4 tablet:px-5 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CircleCheckbox checked={allSelected} onChange={toggleAll} />
          <span
            className="text-sm font-medium text-dark-text cursor-pointer truncate"
            onClick={toggleAll}
          >
            전체 선택 ({selectedIds.length}/{allIds.length})
          </span>
        </div>
        <div className="flex items-center gap-2 tablet:gap-4 text-xs tablet:text-sm text-gray-text shrink-0">
          <button onClick={deleteSelected} className="hover:text-dark-text whitespace-nowrap">선택 삭제</button>
          <span className="text-border">|</span>
          <button onClick={deleteOutOfStock} className="hover:text-dark-text whitespace-nowrap">품절 삭제</button>
        </div>
      </div>

      <CartList
        groups={groups}
        individuals={individuals}
        selectedIds={selectedIds}
        onToggle={toggleItem}
      />
      <RecommendedItems />
    </div>
  );
}

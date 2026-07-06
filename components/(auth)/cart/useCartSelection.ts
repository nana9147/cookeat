'use client';

import { useState, useMemo } from 'react';
import type { MergedCartItem } from './useCartItems';

export function useCartSelection(items: MergedCartItem[]) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => items.map((i) => i.productId));

  const idsKey = useMemo(() => items.map((i) => i.productId).join(','), [items]);
  const [prevIdsKey, setPrevIdsKey] = useState(idsKey);

  if (idsKey !== prevIdsKey) {
    setPrevIdsKey(idsKey);
    const currentIds = idsKey ? idsKey.split(',').map(Number) : [];
    setSelectedIds((prev) => {
      const kept = prev.filter((id) => currentIds.includes(id));
      const added = currentIds.filter((id) => !prev.includes(id));
      return [...kept, ...added];
    });
  }

  const allIds = items.map((i) => i.productId);
  const validSelected = selectedIds.filter((id) => allIds.includes(id));
  const allSelected = allIds.length > 0 && validSelected.length === allIds.length;

  const toggleAll = () => setSelectedIds(allSelected ? [] : [...allIds]);
  const toggleItem = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return { validSelected, allSelected, toggleAll, toggleItem, setSelectedIds };
}

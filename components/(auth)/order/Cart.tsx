'use client';

import { useState } from 'react';
import CartList from './CartList';
import RecommendedItems from './RecommendedItems';
import CircleCheckbox from './CircleCheckbox';

export default function Cart() {
  const [allSelected, setAllSelected] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-border rounded-xl px-4 tablet:px-5 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CircleCheckbox checked={allSelected} onChange={() => setAllSelected(!allSelected)} />
          <span
            className="text-sm font-medium text-dark-text cursor-pointer truncate"
            onClick={() => setAllSelected(!allSelected)}
          >
            전체 선택 (9/9)
          </span>
        </div>
        <div className="flex items-center gap-2 tablet:gap-4 text-xs tablet:text-sm text-gray-text shrink-0">
          <button className="hover:text-dark-text whitespace-nowrap">선택 삭제</button>
          <span className="text-border">|</span>
          <button className="hover:text-dark-text whitespace-nowrap">품절 삭제</button>
        </div>
      </div>

      <CartList />
      <RecommendedItems />
    </div>
  );
}

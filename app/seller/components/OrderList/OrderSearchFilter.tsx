'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import FilterTabs from '@/app/seller/components/FilterTabs';
import type { OrderSearchProps } from '@/types/seller/order';

export default function OrderSearch({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statuses,
}: OrderSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-5">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="주문번호, 고객명으로 검색"
          className="py-5 bg-card"
        />
        <Button
          onClick={() => setIsFilterOpen((prev) => !prev)}
          variant="outline"
          className="flex items-center gap-1.5 px-4 shrink-0 py-5 bg-card"
        >
          <Filter />
          필터
        </Button>
      </div>
      {isFilterOpen && <FilterTabs options={statuses} value={status} onChange={onStatusChange} />}
    </div>
  );
}

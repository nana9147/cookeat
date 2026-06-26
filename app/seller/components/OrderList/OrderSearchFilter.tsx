'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import FilterTabs from '@/app/seller/components/FilterTabs';
import DateRangeFilter from '@/app/seller/components/DateRangeFilter';
import type { OrderSearchProps } from '@/types/seller/order';
import type { DateRangeFilterProps } from '@/types/seller/common';

type Props = OrderSearchProps & DateRangeFilterProps;

export default function OrderSearchFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statuses,
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-5">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="주문번호, 고객명, 연락처로 검색"
          className="py-5 bg-card"
        />
        <DateRangeFilter
          datePreset={datePreset}
          onDatePresetChange={onDatePresetChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
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
      {isFilterOpen && (
        <FilterTabs
          options={statuses}
          value={status}
          onChange={onStatusChange}
          getLabel={(status) => {
            if (status === '결제완료') return '신규주문';
            if (status === '배송준비') return '배송준비중';
            return status;
          }}
        />
      )}
    </div>
  );
}

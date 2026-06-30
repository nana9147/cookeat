'use client';

import { Input } from '@/components/ui/input';
import DateRangeFilter from '../DateRangeFilter';
import type { DateRangeFilterProps } from '@/types/seller/common';

interface ShippingSearchFilterProps extends DateRangeFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function ShippingSearchFilter({
  search,
  onSearchChange,
  placeholder = '주문번호, 주문자로 검색',
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ShippingSearchFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 py-5 bg-card"
      />
      <DateRangeFilter
        datePreset={datePreset}
        onDatePresetChange={onDatePresetChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    </div>
  );
}

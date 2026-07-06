'use client';

import type { SettlementSearchFilterProps } from '@/types/seller/settlement';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function SettlementSearchFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
}: SettlementSearchFilterProps) {
  return (
    <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-5 py-4 mb-6 max-tablet:flex-col max-tablet:items-stretch max-mobile:px-4 max-mobile:py-3">
      <div className="flex items-center gap-1.5 text-sm text-gray-text shrink-0">
        <Calendar size={15} className="text-primary" />
        조회 기간
      </div>
      <div className="flex items-center gap-2 max-tablet:w-full max-mobile:flex-col max-mobile:items-stretch">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-40 max-tablet:w-full"
        />
        <span className="text-gray-text text-sm">~</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-40 max-tablet:w-full"
        />
      </div>
      <Button onClick={onSearch} className="shrink-0 max-tablet:w-full">
        조회
      </Button>
    </div>
  );
}

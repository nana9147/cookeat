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
    <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-5 py-4 mb-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-text shrink-0">
        <Calendar size={15} className="text-primary" />
        조회 기간
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-40"
        />
        <span className="text-gray-text text-sm">~</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-40"
        />
      </div>
      <Button onClick={onSearch} className="shrink-0">
        조회
      </Button>
    </div>
  );
}

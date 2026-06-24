'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangeFilterProps, DateRangePreset } from '@/types/seller/shipping';

const PRESETS: DateRangePreset[] = ['전체', '오늘', '1주일', '1개월', '3개월', '직접입력'];

export default function DateRangeFilter({
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={datePreset} onValueChange={(v) => onDatePresetChange(v as DateRangePreset)}>
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {datePreset !== '전체' && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-36"
          />
          <span className="text-gray-400 text-sm">~</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-36"
          />
        </div>
      )}
    </div>
  );
}

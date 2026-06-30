export type DateRangePreset = '전체' | '오늘' | '1주일' | '1개월' | '3개월' | '직접입력';

export interface DateRangeFilterProps {
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

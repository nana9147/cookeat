import type { DateRangePreset } from '@/types/seller/common';

export const toDateStr = (d: Date) => d.toISOString().split('T')[0];

export const getDateRange = (preset: DateRangePreset): { startDate: string; endDate: string } => {
  const today = new Date();
  const end = toDateStr(today);

  if (preset === '전체') return { startDate: '', endDate: '' };
  if (preset === '오늘') return { startDate: end, endDate: end };

  const start = new Date(today);
  if (preset === '1주일') start.setDate(today.getDate() - 7);
  if (preset === '1개월') start.setMonth(today.getMonth() - 1);
  if (preset === '3개월') start.setMonth(today.getMonth() - 3);

  return { startDate: toDateStr(start), endDate: end };
};

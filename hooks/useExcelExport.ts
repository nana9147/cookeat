import { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '@/lib/api';
import { toast } from 'sonner';

const EXPORT_BATCH_SIZE = 1000;

export interface ExportColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: T[keyof T]) => string | number;
}

export interface UseExcelExportOptions<T> {
  endpoint: string;
  columns: ExportColumn<T>[];
  sheetName: string;
  fileNamePrefix: string;
  countBy?: keyof T;
}

export function useExcelExport<T>({
  endpoint,
  columns,
  sheetName,
  fileNamePrefix,
  countBy,
}: UseExcelExportOptions<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const exportToExcel = async (params: Record<string, string | undefined>) => {
    setIsExporting(true);
    setProgress({ current: 0, total: 0 });

    try {
      let allRows: T[] = [];
      let offset = 0;
      let total = 0;

      do {
        const res = await api.get(endpoint, {
          params: { ...params, offset, limit: EXPORT_BATCH_SIZE },
        });

        const { orders: batchRows, total: batchTotal } = res.data.data;
        total = batchTotal;
        allRows = [...allRows, ...batchRows];
        offset += EXPORT_BATCH_SIZE;

        setProgress({ current: allRows.length, total });
      } while (offset < total);

      if (allRows.length === 0) {
        toast.error('다운로드할 데이터가 없습니다.');
        return;
      }

      const sheetData = allRows.map((row, index) => {
        const record: Record<string, string | number> = { 'No.': index + 1 };
        columns.forEach(({ key, label, format }) => {
          const value = row[key];
          record[label] = format ? format(value) : (value as string | number);
        });
        return record;
      });

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${fileNamePrefix}_${today}.xlsx`);

      const displayCount = countBy
        ? new Set(allRows.map((row) => row[countBy])).size
        : allRows.length;

      toast.success(`${displayCount}건을 다운로드했습니다.`);
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '엑셀 다운로드에 실패했습니다.');
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return { exportToExcel, isExporting, progress };
}

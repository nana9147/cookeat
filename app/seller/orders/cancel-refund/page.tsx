'use client';

import { useCallback, useEffect, useState } from 'react';
import { useExcelExport, ExportColumn } from '@/hooks/useExcelExport';
import type { RefundExportRow } from '@/types/seller/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import RefundTable from '../../components/OrderList/RefundTable';
import StatusCards from '@/components/ui/StatusCards';
import DateRangeFilter from '../../components/DateRangeFilter';
import type { OrderWithRefunds } from '@/types/seller/order';
import type { DateRangePreset } from '@/types/seller/common';
import { toDateStr, getDateRange } from '@/lib/dateRange';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LIMIT = 10;

const REFUND_COLOR_MAP = {
  전체: 'text-gray-600',
  취소요청: 'text-amber-500',
  환불요청: 'text-red-500',
  환불진행중: 'text-blue-500',
  처리완료: 'text-emerald-500',
};

const EXPORT_COLUMNS: ExportColumn<RefundExportRow>[] = [
  { key: 'orderId', label: '주문번호' },
  { key: 'customer', label: '주문자' },
  { key: 'productName', label: '상품명' },
  { key: 'quantity', label: '수량' },
  { key: 'unitPrice', label: '단가' },
  { key: 'refundAmount', label: '환불금액' },
  { key: 'status', label: '처리결과' },
  { key: 'requestReason', label: '신청사유' },
  { key: 'rejectReason', label: '거부사유' },
  { key: 'requestedAt', label: '신청일시', format: (v) => new Date(v as string).toLocaleString() },
  {
    key: 'processedAt',
    label: '처리일시',
    format: (v) => (v ? new Date(v as string).toLocaleString() : ''),
  },
];

export default function CancelRefundPage() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const [tab, setTab] = useState<'전체' | '취소요청' | '환불요청' | '환불진행중' | '처리완료'>(
    '전체'
  );
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<OrderWithRefunds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [datePreset, setDatePreset] = useState<DateRangePreset>('전체');
  const [startDate, setStartDate] = useState(() => getDateRange('전체').startDate);
  const [endDate, setEndDate] = useState(() => getDateRange('전체').endDate);

  const [counts, setCounts] = useState({
    전체: 0,
    취소요청: 0,
    환불요청: 0,
    환불진행중: 0,
    처리완료: 0,
  });

  const [rejectingRefundId, setRejectingRefundId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAllSelectedMode, setIsAllSelectedMode] = useState(false);

  const { exportToExcel, isExporting, progress } = useExcelExport<RefundExportRow>({
    endpoint: '/seller/orders/refunds/export',
    columns: EXPORT_COLUMNS,
    sheetName: '환불내역',
    fileNamePrefix: '환불내역',
    countBy: 'orderId',
  });

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    setPage(1);
    if (preset !== '직접입력') {
      const range = getDateRange(preset);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/seller/orders/refunds/counts');
      setCounts(res.data.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '건수를 불러오지 못했습니다.';
      toast.error(msg, { id: msg });
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/seller/orders/refunds', {
        params: {
          page,
          limit: LIMIT,
          tab,
          keyword: search || undefined,
          startDate,
          endDate,
        },
      });
      setOrders(res.data.data.orders);
      setTotal(res.data.data.pagination.total);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '목록을 불러오지 못했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, tab, search, startDate, endDate]);

  const handleSelect = (refundId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, refundId] : prev.filter((id) => id !== refundId)
    );
    setIsAllSelectedMode(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setIsAllSelectedMode(true);
      setSelectedIds(orders.flatMap((o) => o.refundItems.map((i) => i.refundId)));
    } else {
      setIsAllSelectedMode(false);
      setSelectedIds([]);
    }
  };

  const handleExcelDownload = () => {
    if (!isAllSelectedMode && selectedIds.length === 0) {
      toast.error('다운로드할 항목을 선택해주세요.');
      return;
    }

    const params = isAllSelectedMode ? {} : { refundIds: selectedIds.join(',') };
    exportToExcel(params);
  };

  const handleApprove = async (refundId: number) => {
    try {
      const res = await api.patch(`/seller/orders/refunds/${refundId}`, { action: 'approve' });
      const resultStatus = res.data.data.status;
      const particle = resultStatus === '환불' ? '이' : '가';
      toast.success(`${resultStatus}${particle} 승인되었습니다.`);
      fetchOrders();
      fetchCounts();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '승인에 실패했습니다.');
    }
  };

  const handleProcess = async (refundId: number) => {
    try {
      await api.patch(`/seller/orders/refunds/${refundId}`, { action: 'process' });
      toast.success('환불 처리가 완료되었습니다.');
      fetchOrders();
      fetchCounts();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '환불 처리에 실패했습니다.');
    }
  };

  const handleSaveTracking = async (refundId: number, courier: string, trackingNumber: string) => {
    try {
      await api.patch(`/seller/orders/refunds/${refundId}`, {
        action: 'saveTracking',
        courier,
        trackingNumber,
      });
      toast.success('반송 운송장이 저장되었습니다.');
      fetchOrders();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '저장에 실패했습니다.');
    }
  };

  const handleRejectClick = (refundId: number) => {
    setRejectingRefundId(refundId);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRefundId) return;
    if (!rejectReason.trim()) {
      toast.error('거부 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/seller/orders/refunds/${rejectingRefundId}`, {
        action: 'reject',
        reason: rejectReason,
      });
      const resultStatus = res.data.data.status;
      const baseStatus = resultStatus.replace('요청', '');
      const particle = baseStatus === '환불' ? '을' : '를';
      toast.success(`${baseStatus}${particle} 거부했습니다.`);
      setRejectingRefundId(null);
      fetchOrders();
      fetchCounts();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '거부 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text">
          주문 관리
          <span className="text-light-gray font-normal mx-2">/</span>
          <span className="text-h4 font-medium">취소·환불 관리</span>
        </h1>
        {!isAdmin && (
          <Button onClick={handleExcelDownload} disabled={isExporting}>
            <Download />
            {isExporting
              ? `다운로드 중... (${progress.current}/${progress.total})`
              : '엑셀 다운로드'}
          </Button>
        )}
      </div>

      <StatusCards
        cards={[
          { label: '전체', count: counts.전체, filterValue: '전체' },
          { label: '취소요청', count: counts.취소요청, filterValue: '취소요청' },
          { label: '환불요청', count: counts.환불요청, filterValue: '환불요청' },
          { label: '환불진행중', count: counts.환불진행중, filterValue: '환불진행중' },
          { label: '처리완료', count: counts.처리완료, filterValue: '처리완료' },
        ]}
        status={tab}
        onStatusChange={(v) => {
          setTab(v as '전체' | '취소요청' | '환불요청' | '환불진행중' | '처리완료');
          setPage(1);
        }}
        colorMap={REFUND_COLOR_MAP}
        cols={5}
      />

      <div className="flex items-center gap-2 mb-5">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="주문번호, 상품명으로 검색"
          className="flex-1 py-5 bg-card"
        />
        <DateRangeFilter
          datePreset={datePreset}
          onDatePresetChange={handleDatePresetChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            setDatePreset('직접입력');
            setPage(1);
          }}
          onEndDateChange={(v) => {
            setEndDate(v);
            setDatePreset('직접입력');
            setPage(1);
          }}
        />
      </div>

      <RefundTable
        orders={orders}
        onApprove={handleApprove}
        onProcess={handleProcess}
        onReject={handleRejectClick}
        onSaveTracking={handleSaveTracking}
        selectedIds={selectedIds}
        isAllSelectedMode={isAllSelectedMode}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog
        open={rejectingRefundId !== null}
        onOpenChange={(open) => !open && setRejectingRefundId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 요청 거부</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="거부 사유를 입력해주세요"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingRefundId(null)}>
              취소
            </Button>
            <Button onClick={handleRejectSubmit} disabled={isSubmitting}>
              거부 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CourierCode, ShippingRow, ShippingStatus } from '@/types/seller/shipping';
import { DateRangePreset } from '@/types/seller/common';
import PaymentInfoTable from '../components/Shipping/PaymentInfoTable';
import TrackingTable from '../components/Shipping/TrackingTable';
import StatusCards from '@/components/ui/StatusCards';
import AllOrdersTable from '../components/Shipping/AllOrdersTable';
import api from '@/lib/api';
import { toast } from 'sonner';

const SHIPPING_COLOR_MAP = {
  결제완료: 'text-emerald-500',
  배송준비: 'text-amber-500',
  배송중: 'text-blue-500',
  배송완료: 'text-emerald-500',
};

const LIMIT = 10;

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const getDateRange = (preset: DateRangePreset): { startDate: string; endDate: string } => {
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

export default function ShippingPage() {
  const [status, setStatus] = useState<ShippingStatus | '전체'>('전체');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<ShippingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    결제완료: 0,
    배송준비: 0,
    배송중: 0,
    배송완료: 0,
  });
  const totalCount = counts.결제완료 + counts.배송준비 + counts.배송중 + counts.배송완료;
  const [datePreset, setDatePreset] = useState<DateRangePreset>('전체');
  const [startDate, setStartDate] = useState(() => getDateRange('전체').startDate);
  const [endDate, setEndDate] = useState(() => getDateRange('전체').endDate);
  const isAllStage = status === '전체';
  const isPaymentInfoStage = status === '결제완료';

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    setPage(1);
    if (preset !== '직접입력') {
      const range = getDateRange(preset);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await api.get('/seller/shipping/orders/counts', {
        params: { startDate, endDate },
      });
      setCounts(res.data.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '상태별 건수를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [startDate, endDate]);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/seller/shipping/orders', {
          params: {
            page,
            limit: LIMIT,
            keyword: search || undefined,
            status,
            startDate,
            endDate,
          },
        });
        if (!cancelled) {
          setOrders(res.data.data.orders);
          setTotal(res.data.data.pagination.total);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : '주문 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [page, status, search, startDate, endDate]);

  const statusCardData = [
    { label: '전체', count: totalCount, filterValue: '전체' },
    { label: '결제완료', count: counts.결제완료, filterValue: '결제완료' },
    { label: '배송준비', count: counts.배송준비, filterValue: '배송준비' },
    { label: '배송중', count: counts.배송중, filterValue: '배송중' },
    { label: '배송완료', count: counts.배송완료, filterValue: '배송완료' },
  ];

  const handleStatusChange = async (orderId: string, newStatus: ShippingStatus) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      fetchCounts();
      toast.success(`'${newStatus}'로 변경되었습니다.`);
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '상태 변경에 실패했습니다.');
    }
  };

  const handleStatusChangeInAllView = async (orderId: string, newStatus: ShippingStatus) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
      fetchCounts();
      toast.success(`'${newStatus}'로 변경되었습니다.`);
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '상태 변경에 실패했습니다.');
    }
  };

  const handleUpdateInAllView = async (
    orderId: string,
    courier: CourierCode | '',
    trackingNumber: string
  ) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}`, { courier, trackingNumber });
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? { ...o, courier, trackingNumber, status: '배송중' as ShippingStatus }
            : o
        )
      );
      fetchCounts();
      toast.success('운송장 정보가 등록되었습니다.');
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '운송장 등록에 실패했습니다.');
    }
  };

  const handleBulkSuccess = (processedOrderIds: string[]) => {
    setOrders((prev) => prev.filter((o) => !processedOrderIds.includes(o.orderId)));
    fetchCounts();
  };

  const handleUpdate = async (
    orderId: string,
    courier: CourierCode | '',
    trackingNumber: string
  ) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}`, { courier, trackingNumber });
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      fetchCounts();
      toast.success('운송장 정보가 등록되었습니다.');
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '운송장 등록에 실패했습니다.');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const dateFilterProps = {
    datePreset,
    onDatePresetChange: handleDatePresetChange,
    startDate,
    endDate,
    onStartDateChange: (v: string) => {
      setStartDate(v);
      setDatePreset('직접입력');
      setPage(1);
    },
    onEndDateChange: (v: string) => {
      setEndDate(v);
      setDatePreset('직접입력');
      setPage(1);
    },
  };

  return (
    <div className="bg-background p-8">
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-dark-text">
          배송 관리
          <span className="text-light-gray font-normal mx-2">/</span>
          <span className="text-h4 font-medium">배송 처리</span>
        </h1>
      </div>
      <StatusCards
        cards={statusCardData}
        status={status}
        onStatusChange={(v) => {
          setStatus(v as ShippingStatus | '전체');
          setPage(1);
        }}
        colorMap={SHIPPING_COLOR_MAP}
        cols={5}
      />
      {isAllStage ? (
        <AllOrdersTable
          orders={orders}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onUpdate={handleUpdateInAllView}
          onStatusChange={handleStatusChangeInAllView}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          {...dateFilterProps}
        />
      ) : isPaymentInfoStage ? (
        <PaymentInfoTable
          orders={orders}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onStatusChange={handleStatusChange}
          onBulkSuccess={handleBulkSuccess}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          {...dateFilterProps}
        />
      ) : (
        <TrackingTable
          orders={orders}
          status={status as '배송준비' | '배송중' | '배송완료'}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onUpdate={handleUpdate}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          {...dateFilterProps}
        />
      )}
    </div>
  );
}

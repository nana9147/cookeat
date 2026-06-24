'use client';

import { useEffect, useState } from 'react';
import { CourierCode, ShippingOrder, ShippingStatus } from '@/types/seller/shipping';
import PaymentInfoTable from '../components/Shipping/PaymentInfoTable';
import TrackingTable from '../components/Shipping/TrackingTable';
import StatusCards from '@/components/ui/StatusCards';
import api from '@/lib/api';
import { toast } from 'sonner';

const SHIPPING_COLOR_MAP = {
  결제완료: 'text-emerald-500',
  배송준비: 'text-amber-500',
  배송중: 'text-blue-500',
  배송완료: 'text-emerald-500',
};

const LIMIT = 10;

export default function ShippingPage() {
  const [status, setStatus] = useState<ShippingStatus>('결제완료');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    결제완료: 0,
    배송준비: 0,
    배송중: 0,
    배송완료: 0,
  });

  const fetchCounts = async () => {
    try {
      const res = await api.get('/seller/shipping/orders/counts');
      setCounts(res.data.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '상태별 건수를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

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
  }, [page, status, search]);

  const statusCardData = [
    { label: '결제완료', count: counts.결제완료, filterValue: '결제완료' },
    { label: '배송준비', count: counts.배송준비, filterValue: '배송준비' },
    { label: '배송중', count: counts.배송중, filterValue: '배송중' },
    { label: '배송완료', count: counts.배송완료, filterValue: '배송완료' },
  ];

  const handleStatusChange = async (orderId: string, newStatus: ShippingStatus) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
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

  const handleUpdate = async (
    orderId: string,
    courier: CourierCode | '',
    trackingNumber: string
  ) => {
    try {
      await api.patch(`/seller/shipping/orders/${orderId}`, { courier, trackingNumber });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
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
  const isPaymentInfoStage = status === '결제완료';

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
          setStatus(v as ShippingStatus);
          setPage(1);
        }}
        colorMap={SHIPPING_COLOR_MAP}
        cols={5}
      />
      {isPaymentInfoStage ? (
        <PaymentInfoTable
          orders={orders}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
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
        />
      )}
    </div>
  );
}

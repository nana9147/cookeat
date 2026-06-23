'use client';

import { useEffect, useState } from 'react';
import { CourierCode, ShippingOrder, ShippingStatus } from '@/types/seller/shipping';
import ShippingTable from '../components/Shipping/ShippingTable';
import StatusCards from '@/components/ui/StatusCards';
import api from '@/lib/api';
import { toast } from 'sonner';

const SHIPPING_COLOR_MAP = {
  주문확인: 'text-purple-500',
  배송준비: 'text-amber-500',
  배송중: 'text-blue-500',
  배송완료: 'text-emerald-500',
};

const LIMIT = 10;

export default function ShippingPage() {
  const [status, setStatus] = useState<ShippingStatus | '전체'>('전체');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ 주문확인: 0, 배송준비: 0, 배송중: 0, 배송완료: 0 });

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
            status: status === '전체' ? undefined : status,
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
    { label: '주문확인', count: counts.주문확인, filterValue: '주문확인' },
    { label: '배송준비', count: counts.배송준비, filterValue: '배송준비' },
    { label: '배송중', count: counts.배송중, filterValue: '배송중' },
    { label: '배송완료', count: counts.배송완료, filterValue: '배송완료' },
  ];

  const handleUpdate = (orderId: string, courier: CourierCode | '', trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, courier, trackingNumber } : o))
    );
  };

  const totalPages = Math.ceil(total / LIMIT);
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
          setStatus(v);
          setPage(1);
        }}
        colorMap={SHIPPING_COLOR_MAP}
        cols={4}
      />
      <ShippingTable
        orders={orders}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onUpdate={handleUpdate}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

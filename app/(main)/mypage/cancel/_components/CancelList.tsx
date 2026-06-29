'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import OrderCard from '../../orders/_components/OrderCard';
import OrderDetailModal from '../../orders/_components/OrderDetailModal';
import OrderPagination from '../../orders/_components/OrderPagination';
import type { Order, Pagination } from '../../orders/_components/types';

const CANCEL_TABS = ['취소', '반품'] as const;
type CancelTab = (typeof CANCEL_TABS)[number];

export default function CancelList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CancelTab>('취소');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ orders: Order[]; pagination: Pagination }>(
        `/orders?page=${page}&status=${encodeURIComponent(activeTab)}`
      )
      .then(({ data }) => {
        if (cancelled) return;
        setError(null);
        setOrders(data.orders);
        setPagination(data.pagination);
      })
      .catch(() => { if (!cancelled) setError('주문 내역을 불러오지 못했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, activeTab]);

  const handleTabChange = (tab: CancelTab) => { setActiveTab(tab); setPage(1); };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-text">취소 / 반품</h3>
        {pagination && <span className="text-xs text-gray-text">총 {pagination.total}건</span>}
      </div>
      <div className="flex gap-1.5">
        {CANCEL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-primary text-white' : 'bg-beige text-gray-text hover:bg-primary/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border rounded-2xl h-48 bg-beige animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-red">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-gray-text">{activeTab} 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onDetailClick={() => setSelectedOrderId(order.orderId)}
            />
          ))}
        </div>
      )}
      {pagination && pagination.total > pagination.limit && (
        <OrderPagination
          page={page}
          total={pagination.total}
          limit={pagination.limit}
          hasNext={pagination.hasNext}
          onPageChange={setPage}
        />
      )}
      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
}

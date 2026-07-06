'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import OrderCard from './OrderCard';
import OrderStatusTabs from './OrderStatusTabs';
import OrderPagination from './OrderPagination';
import OrderDetailModal from './OrderDetailModal';
import type { Order, Pagination } from './types';
import type { StatusTab } from './OrderStatusTabs';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('전체');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    const statusParam = activeTab === '전체' ? '' : `&status=${encodeURIComponent(activeTab)}`;
    return api
      .get<{ orders: Order[]; pagination: Pagination }>(`/orders?page=${page}${statusParam}`)
      .then(({ data }) => {
        setOrders(data.orders);
        setPagination(data.pagination);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tab: StatusTab) => { setLoading(true); setActiveTab(tab); setPage(1); };
  const handlePageChange = (p: number) => { setLoading(true); setPage(p); };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-dark-text">주문/배송 내역</h3>
          {pagination && <span className="text-xs text-gray-text">총 {pagination.total}건</span>}
        </div>
        <OrderStatusTabs activeTab={activeTab} onTabChange={handleTabChange} />
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-2xl h-48 bg-beige animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-12 h-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-text">주문 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onDetailClick={() => setSelectedOrderId(order.orderId)}
                onCancelRequested={fetchOrders}
                onRefundRequested={fetchOrders}
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
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}

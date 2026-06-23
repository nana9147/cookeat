'use client';

import { useState } from 'react';
import { CourierCode, ShippingOrder, ShippingStatus } from '@/types/seller/shipping';
import ShippingTable from '../components/Shipping/ShippingTable';
import { useFilter } from '@/hooks/useFilter';
import StatusCards from '@/components/ui/StatusCards';

const MOCK_SHIPPING_ORDERS: ShippingOrder[] = [
  {
    id: 'ORD-2026-001',
    customer: '김철수',
    products: ['유기농 토마토 500g', '애호박 1개', '청양고추 500g'],
    orderDate: '2026-06-10 09:12:33',
    status: '배송준비',
    courier: '',
    trackingNumber: '',
  },
  {
    id: 'ORD-2026-002',
    customer: '이영희',
    products: ['청양고추 1kg'],
    orderDate: '2026-06-10 10:05:17',
    status: '배송준비',
    courier: '',
    trackingNumber: '',
  },
  {
    id: 'ORD-2026-003',
    customer: '박민수',
    products: ['국내산 달걀 30구'],
    orderDate: '2026-06-09 14:23:45',
    status: '배송중',
    courier: 'CJ대한통운',
    trackingNumber: '123456789012',
  },
  {
    id: 'ORD-2026-004',
    customer: '최지원',
    products: ['유기농 감자 1kg'],
    orderDate: '2026-06-09 11:30:22',
    status: '배송중',
    courier: '한진택배',
    trackingNumber: '987654321098',
  },
  {
    id: 'ORD-2026-005',
    customer: '정하늘',
    products: ['프리미엄 올리브유', '국내산 달걀 30구'],
    orderDate: '2026-06-08 16:44:05',
    status: '배송준비',
    courier: 'CJ대한통운',
    trackingNumber: '111222333444',
  },
  {
    id: 'ORD-2026-006',
    customer: '한바다',
    products: ['생크림 200ml'],
    orderDate: '2026-06-08 13:55:47',
    status: '배송완료',
    courier: '로젠택배',
    trackingNumber: '555666777888',
  },
];

const SHIPPING_COLOR_MAP = {
  주문확인: 'text-purple-500',
  배송준비: 'text-amber-500',
  배송중: 'text-blue-500',
  배송완료: 'text-emerald-500',
};

export default function ShippingPage() {
  const [status, setStatus] = useState<ShippingStatus | '전체'>('전체');
  const [shippingOrders, setShippingOrders] = useState(MOCK_SHIPPING_ORDERS);

  const {
    search,
    setSearch,
    filtered: filteredBySearch,
  } = useFilter(
    shippingOrders,
    (o, search) => o.customer.includes(search) || o.id.includes(search)
  );

  const filtered = filteredBySearch.filter((o) => status === '전체' || o.status === status);

  const statusCardData = [
    {
      label: '주문확인',
      count: shippingOrders.filter((o) => o.status === '주문확인').length,
      filterValue: '주문확인',
    },
    {
      label: '배송준비',
      count: shippingOrders.filter((o) => o.status === '배송준비').length,
      filterValue: '배송준비',
    },
    {
      label: '배송중',
      count: shippingOrders.filter((o) => o.status === '배송중').length,
      filterValue: '배송중',
    },
    {
      label: '배송완료',
      count: shippingOrders.filter((o) => o.status === '배송완료').length,
      filterValue: '배송완료',
    },
  ];

  const handleUpdate = (orderId: string, courier: string, trackingNumber: string) => {
    setShippingOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, courier: courier as CourierCode, trackingNumber, status: '배송중' }
          : o
      )
    );
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
        onStatusChange={setStatus}
        colorMap={SHIPPING_COLOR_MAP}
        cols={4}
      />
      <ShippingTable
        orders={filtered}
        search={search}
        onSearchChange={setSearch}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

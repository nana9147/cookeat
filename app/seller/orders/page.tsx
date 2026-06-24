'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type {
  Order,
  OrderSortBy,
  SortOrder,
  OrderStatus,
  OrderStatusFilter,
  StatusCardItem,
} from '@/types/seller/order';
import OrderSearchFilter from '../components/OrderList/OrderSearchFilter';
import OrderTable from '../components/OrderList/OrderTable';
import StatusCards from '@/components/ui/StatusCards';
import { useFilter } from '@/hooks/useFilter';

const statuses: (OrderStatus | '전체')[] = [
  '전체',
  '결제완료',
  '배송완료',
  '배송준비',
  '배송중',
  '취소',
  '환불',
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: '김가을',
    recipient: '김가을',
    phone: '010-1111-2222',
    product: '유기농 토마토 500g',
    price: 15900,
    status: '배송준비',
    orderDate: '2026-06-09 11:56:39',
  },
  {
    id: 'ORD-2024-002',
    customer: '이여름',
    recipient: '이여름',
    phone: '010-2222-3333',
    product: '무농약 상추 300g',
    price: 8500,
    status: '결제완료',
    orderDate: '2026-06-09 14:16:22',
  },
  {
    id: 'ORD-2024-003',
    customer: '박겨울',
    recipient: '박겨울',
    phone: '010-3333-4444',
    product: '국내산 달걀 30구',
    price: 12000,
    status: '배송중',
    orderDate: '2026-06-08 09:23:11',
  },
  {
    id: 'ORD-2024-004',
    customer: '최봄',
    recipient: '최봄',
    phone: '010-4444-5555',
    product: '유기농 감자 1kg',
    price: 9800,
    status: '배송완료',
    orderDate: '2026-06-07 16:44:05',
  },
  {
    id: 'ORD-2024-005',
    customer: '정하늘',
    recipient: '정하늘',
    phone: '010-5555-6666',
    product: '프리미엄 올리브유',
    price: 32000,
    status: '결제완료',
    orderDate: '2026-06-09 10:12:33',
  },
  {
    id: 'ORD-2024-006',
    customer: '한바다',
    recipient: '한바다',
    phone: '010-6666-7777',
    product: '생크림 200ml',
    price: 4800,
    status: '배송중',
    orderDate: '2026-06-08 13:55:47',
  },
  {
    id: 'ORD-2024-007',
    customer: '윤서준',
    recipient: '윤서준',
    phone: '010-7777-8888',
    product: '유기농 양파 1kg',
    price: 5500,
    status: '취소',
    orderDate: '2026-06-07 08:30:22',
  },
  {
    id: 'ORD-2024-008',
    customer: '임지아',
    recipient: '임지아',
    phone: '010-8888-9999',
    product: '신선 토마토 500g',
    price: 8500,
    status: '환불',
    orderDate: '2026-06-06 15:20:18',
  },
  {
    id: 'ORD-2024-009',
    customer: '강민준',
    recipient: '강민준',
    phone: '010-9999-0000',
    product: '쌀 10kg',
    price: 45000,
    status: '배송완료',
    orderDate: '2026-06-05 11:10:09',
  },
  {
    id: 'ORD-2024-010',
    customer: '오수빈',
    recipient: '오수빈',
    phone: '010-0000-1111',
    product: '밀키트 2인분',
    price: 18000,
    status: '취소',
    orderDate: '2026-06-09 09:05:55',
  },
];

const ORDER_COLOR_MAP = {
  결제완료: 'text-emerald-500',
  배송준비: 'text-amber-500',
  배송중: 'text-blue-500',
  배송완료: 'text-taupe-500',
  '취소/환불': 'text-red-500',
};

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatusFilter>('전체');
  const [sortBy, setSortBy] = useState<OrderSortBy>('orderDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelectedMode, setIsAllSelectedMode] = useState(false);
  const [page, setPage] = useState(1);

  const {
    search,
    setSearch,
    filtered: filteredBySearch,
  } = useFilter(
    MOCK_ORDERS,
    (o, search) => o.customer.includes(search) || o.id.includes(search) || o.phone.includes(search)
  );

  const filtered = filteredBySearch.filter((o) => {
    return status === '전체'
      ? true
      : status === '취소환불'
        ? o.status === '취소' || o.status === '환불'
        : o.status === status;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    }
    const aTime = new Date(a.orderDate).getTime();
    const bTime = new Date(b.orderDate).getTime();
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  const statusCardData: StatusCardItem[] = [
    {
      label: '결제완료',
      count: MOCK_ORDERS.filter((o) => o.status === '결제완료').length,
      filterValue: '결제완료',
    },
    {
      label: '배송준비',
      count: MOCK_ORDERS.filter((o) => o.status === '배송준비').length,
      filterValue: '배송준비',
    },
    {
      label: '배송중',
      count: MOCK_ORDERS.filter((o) => o.status === '배송중').length,
      filterValue: '배송중',
    },
    {
      label: '배송완료',
      count: MOCK_ORDERS.filter((o) => o.status === '배송완료').length,
      filterValue: '배송완료',
    },
    {
      label: '취소/환불',
      count: MOCK_ORDERS.filter((o) => o.status === '취소' || o.status === '환불').length,
      filterValue: '취소환불',
    },
  ];

  const handleSortChange = (newSortBy: OrderSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleSelect = (orderId: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)));
    setIsAllSelectedMode(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setIsAllSelectedMode(true);
      setSelectedIds(sorted.map((o) => o.id));
    } else {
      setIsAllSelectedMode(false);
      setSelectedIds([]);
    }
  };

  return (
    <div className="bg-background p-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <h1 className="text-h2 font-bold text-dark-text">주문 관리</h1>
        <Button>
          <Download />
          엑셀 다운로드
        </Button>
      </div>
      <StatusCards
        cards={statusCardData}
        status={status}
        onStatusChange={(v) => setStatus(v as OrderStatusFilter)}
        colorMap={ORDER_COLOR_MAP}
        cols={5}
      />
      <OrderSearchFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statuses={statuses}
      />
      <div className="flex items-center justify-start mb-2 px-5">
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-gray-800">{sorted.length}</span>건
        </p>
      </div>

      <OrderTable
        orders={sorted}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        selectedIds={selectedIds}
        isAllSelectedMode={isAllSelectedMode}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        page={page}
        totalPages={1}
        onPageChange={setPage}
      />
    </div>
  );
}

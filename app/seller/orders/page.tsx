'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Order, OrderStatus, OrderStatusFilter } from '@/types/seller/order';
import { Download, Filter } from 'lucide-react';
import { useState } from 'react';
import FilterTabs from '../components/FilterTabs';
import OrderTable from '../components/OrderList/OrderTable';

const statuses: (OrderStatus | '전체')[] = [
  '전체',
  '결제완료',
  '배송완료',
  '배송준비중',
  '배송중',
  '취소',
  '환불',
];

const orders: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: '김가을',
    product: '유기농 토마토 500g',
    price: 15900,
    status: '배송준비중',
    orderDate: '2026-06-09 11:56:39',
  },
  {
    id: 'ORD-2024-002',
    customer: '이여름',
    product: '무농약 상추 300g',
    price: 8500,
    status: '결제완료',
    orderDate: '2026-06-09 14:16:22',
  },
  {
    id: 'ORD-2024-003',
    customer: '박겨울',
    product: '국내산 달걀 30구',
    price: 12000,
    status: '배송중',
    orderDate: '2026-06-08 09:23:11',
  },
  {
    id: 'ORD-2024-004',
    customer: '최봄',
    product: '유기농 감자 1kg',
    price: 9800,
    status: '배송완료',
    orderDate: '2026-06-07 16:44:05',
  },
  {
    id: 'ORD-2024-005',
    customer: '정하늘',
    product: '프리미엄 올리브유',
    price: 32000,
    status: '결제완료',
    orderDate: '2026-06-09 10:12:33',
  },
  {
    id: 'ORD-2024-006',
    customer: '한바다',
    product: '생크림 200ml',
    price: 4800,
    status: '배송중',
    orderDate: '2026-06-08 13:55:47',
  },
  {
    id: 'ORD-2024-007',
    customer: '윤서준',
    product: '유기농 양파 1kg',
    price: 5500,
    status: '취소',
    orderDate: '2026-06-07 08:30:22',
  },
  {
    id: 'ORD-2024-008',
    customer: '임지아',
    product: '신선 토마토 500g',
    price: 8500,
    status: '환불',
    orderDate: '2026-06-06 15:20:18',
  },
  {
    id: 'ORD-2024-009',
    customer: '강민준',
    product: '쌀 10kg',
    price: 45000,
    status: '배송완료',
    orderDate: '2026-06-05 11:10:09',
  },
  {
    id: 'ORD-2024-010',
    customer: '오수빈',
    product: '밀키트 2인분',
    price: 18000,
    status: '취소',
    orderDate: '2026-06-09 09:05:55',
  },
];

const statusCounts = {
  결제완료: orders.filter((o) => o.status === '결제완료').length,
  배송준비중: orders.filter((o) => o.status === '배송준비중').length,
  배송중: orders.filter((o) => o.status === '배송중').length,
  배송완료: orders.filter((o) => o.status === '배송완료').length,
  취소환불: orders.filter((o) => o.status === '취소' || o.status === '환불').length,
};

const statusCardData = [
  { label: '결제완료', count: statusCounts.결제완료, filterValue: '결제완료' },
  { label: '배송준비중', count: statusCounts.배송준비중, filterValue: '배송준비중' },
  { label: '배송중', count: statusCounts.배송중, filterValue: '배송중' },
  { label: '배송완료', count: statusCounts.배송완료, filterValue: '배송완료' },
  { label: '취소/환불', count: statusCounts.취소환불, filterValue: '취소환불' },
];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatusFilter>('전체');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = orders.filter((o) => {
    const matchStatus =
      status === '전체'
        ? true
        : status === '취소환불'
          ? o.status === '취소' || o.status === '환불'
          : o.status === status;
    const matchSearch = o.customer.includes(search) || o.id.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-background p-8">
      {/* 헤더 */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h1 className="text-h2 font-bold text-dark-text">주문 관리</h1>
        <Button>
          <Download />
          엑셀 다운로드
        </Button>
      </div>

      {/* 현황 카드 */}
      <div className="grid grid-cols-5 gap-4  mb-5">
        {statusCardData.map((item) => (
          <Card
            key={item.label}
            className={`cursor-pointer ... ${status === item.filterValue ? 'ring-2 ring-primary' : ''}`}
            onClick={() => {
              const newFilter = item.filterValue as OrderStatusFilter;
              setStatus((prev) => (prev === newFilter ? '전체' : newFilter));
            }}
          >
            <CardContent className="py-2">
              <p className="text-sm text-gray-500 mb-2">{item.label}</p>
              <p
                className={`text-2xl font-bold ${
                  item.label === '결제완료'
                    ? 'text-green-500'
                    : item.label === '배송준비중'
                      ? 'text-yellow-500'
                      : item.label === '배송중'
                        ? 'text-blue-500'
                        : item.label === '배송완료'
                          ? 'text-taupe-500'
                          : 'text-red-500'
                }`}
              >
                {item.count}건
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* 검색 */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex gap-2">
          {' '}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="주문번호, 고객명으로 검색"
            className="py-5 bg-card"
          />
          <Button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            variant="outline"
            className="flex items-center gap-1.5 px-4 shrink-0 py-5 bg-card"
          >
            <Filter />
            필터
          </Button>
        </div>

        {/* 필터 탭 */}
        {isFilterOpen && <FilterTabs options={statuses} value={status} onChange={setStatus} />}
      </div>

      {/* 테이블 */}
      {/* <OrderTable /> */}
    </div>
  );
}

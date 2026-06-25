'use client';

import type { Order, OrderSortBy, SortOrder } from '@/types/seller/order';
import StatusBadge from '@/app/seller/components/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { getPageNumbers } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderTableProps {
  orders: Order[];
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: OrderSortBy) => void;
  selectedIds: string[];
  isAllSelectedMode: boolean;
  onSelect: (orderId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OrderTable({
  orders,
  sortBy,
  sortOrder,
  onSortChange,
  selectedIds,
  isAllSelectedMode,
  onSelect,
  onSelectAll,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: OrderTableProps) {
  const renderSortIcon = (column: OrderSortBy) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className="inline w-3.5 h-3.5 ml-0.5 text-gray-500" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="inline w-3.5 h-3.5 ml-0.5" />
    ) : (
      <ChevronDown className="inline w-3.5 h-3.5 ml-0.5" />
    );
  };

  const isAllChecked =
    isAllSelectedMode || (selectedIds.length === orders.length && orders.length > 0);

  return (
    <div className=" bg-white rounded-xl border border-gray-200 overflow-hidden py-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-10">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableHead>
            <TableHead className="text-center">주문번호</TableHead>
            <TableHead
              className="text-center cursor-pointer select-none hover:bg-gray-100 transition-colors"
              onClick={() => onSortChange('orderDate')}
            >
              주문일시{renderSortIcon('orderDate')}
            </TableHead>
            <TableHead className="text-center">주문자</TableHead>
            <TableHead className="text-center">상품</TableHead>
            <TableHead
              className="text-center cursor-pointer select-none hover:bg-gray-100 transition-colors"
              onClick={() => onSortChange('price')}
            >
              금액{renderSortIcon('price')}
            </TableHead>
            <TableHead className="text-center">상태</TableHead>
            <TableHead className="text-center">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                목록을 불러오는 중...
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                주문내역이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelectedMode || selectedIds.includes(order.id)}
                      onChange={(e) => onSelect(order.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm font-mono text-gray-500">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-800">
                    {order.customer}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-700">
                    <span className="block max-w-[160px] truncate mx-auto" title={order.product}>
                      {order.product}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium text-gray-800">
                    {order.price.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button size="sm">상세</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              <EmptyRows count={10 - orders.length} colSpan={8} />
            </>
          )}
        </TableBody>
      </Table>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />
    </div>
  );
}

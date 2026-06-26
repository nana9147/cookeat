'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime, getPageNumbers } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CourierCode,
  ShippingRow,
  ShippingInputState,
  AllOrdersTableProps,
} from '@/types/seller/shipping';
import { useState } from 'react';
import { toast } from 'sonner';
import StatusBadge from '../StatusBadge';
import DateRangeFilter from '../DateRangeFilter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const COURIERS: CourierCode[] = [
  'CJ대한통운',
  '로젠택배',
  '한진택배',
  '롯데택배',
  '우체국택배',
  'CU 편의점택배',
  'GS25 편의점택배',
  'ETC',
];

export default function AllOrdersTable({
  orders,
  search,
  onSearchChange,
  onUpdate,
  onStatusChange,
  isLoading,
  page,
  totalPages,
  onPageChange,
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: AllOrdersTableProps) {
  const [inputs, setInputs] = useState<Record<string, ShippingInputState>>({});

  const handleConfirm = (orderId: string) => {
    const input = inputs[orderId];

    if (!input?.courier) {
      toast.error('택배사를 선택해주세요.');
      return;
    }
    if (!input?.trackingNumber) {
      toast.error('운송장번호를 입력해주세요.');
      return;
    }

    onUpdate(orderId, input.courier, input.trackingNumber);
  };

  const renderTrackingCell = (orderId: string, order: ShippingRow) => {
    if (order.status === '배송준비') {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <Select
            value={inputs[orderId]?.courier ?? ''}
            onValueChange={(value) =>
              setInputs((prev) => ({
                ...prev,
                [orderId]: { ...prev[orderId], courier: value as CourierCode },
              }))
            }
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue placeholder="택배사" />
            </SelectTrigger>
            <SelectContent>
              {COURIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={inputs[orderId]?.trackingNumber ?? ''}
            onChange={(e) =>
              setInputs((prev) => ({
                ...prev,
                [orderId]: { ...prev[orderId], trackingNumber: e.target.value },
              }))
            }
            placeholder="운송장번호"
            className="w-28 whitespace-nowrap [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      );
    }

    if (order.courier && order.trackingNumber) {
      return (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {order.courier} / {order.trackingNumber}
        </span>
      );
    }

    return <span className="text-sm text-gray-400">-</span>;
  };

  const renderActionCell = (orderId: string, order: ShippingRow) => {
    switch (order.status) {
      case '결제완료':
        return (
          <Button size="sm" onClick={() => onStatusChange(orderId, '배송준비')}>
            발주확인
          </Button>
        );
      case '배송준비':
        return (
          <Button size="sm" onClick={() => handleConfirm(orderId)}>
            저장
          </Button>
        );
      case '배송중':
        return (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(orderId, '배송완료')}>
            배송완료 처리
          </Button>
        );
      default:
        return <span className="text-gray-400 text-sm">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="주문번호, 주문자로 검색"
          className="w-64 bg-card"
        />
        <DateRangeFilter
          datePreset={datePreset}
          onDatePresetChange={onDatePresetChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center whitespace-nowrap">주문번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문일시</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문자</TableHead>
              <TableHead className="text-center">상품명</TableHead>
              <TableHead className="text-center whitespace-nowrap">수량</TableHead>
              <TableHead className="text-center whitespace-nowrap">상태</TableHead>
              <TableHead className="text-center whitespace-nowrap">택배사 / 운송장번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">관리</TableHead>
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
                  조회된 주문건이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {orders.map((order) => (
                  <TableRow key={order.itemId}>
                    <TableCell className="text-center text-sm font-mono text-gray-500 whitespace-nowrap">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(order.orderDate)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                      {order.customer}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.productName}
                      >
                        {order.productName}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {renderTrackingCell(order.orderId, order)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {renderActionCell(order.orderId, order)}
                    </TableCell>
                  </TableRow>
                ))}
                <EmptyRows count={10 - orders.length} colSpan={8} />
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />
    </div>
  );
}

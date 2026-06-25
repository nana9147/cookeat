'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPageNumbers } from '@/lib/utils';
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
  ShippingOrder,
  ShippingInputState,
  TrackingTableProps,
} from '@/types/seller/shipping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StatusBadge from '../StatusBadge';
import DateRangeFilter from '@/app/seller/components/DateRangeFilter';
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

const EMPTY_MESSAGE: Record<'배송준비' | '배송중' | '배송완료', string> = {
  배송준비: '배송준비 중인 주문건이 없습니다.',
  배송중: '배송중인 주문건이 없습니다.',
  배송완료: '배송완료된 주문건이 없습니다.',
};

export default function TrackingTable({
  orders,
  status,
  search,
  onSearchChange,
  onStatusChange,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onUpdate,
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: TrackingTableProps) {
  const [inputs, setInputs] = useState<Record<string, ShippingInputState>>({});
  const [defaultCourier, setDefaultCourier] = useState<CourierCode | ''>('');
  const isEditable = status === '배송준비';
  const isShipping = status === '배송중';
  const hasActionColumn = isEditable || isShipping;

  useEffect(() => {
    if (!defaultCourier || !isEditable) return;

    setInputs((prev) => {
      const next = { ...prev };
      orders.forEach((order) => {
        const current = next[order.id];
        if (!current?.courier || current.isAutoFilledCourier) {
          next[order.id] = {
            courier: defaultCourier,
            trackingNumber: current?.trackingNumber ?? '',
            isEditing: current?.isEditing ?? false,
            isAutoFilledCourier: true,
          };
        }
      });
      return next;
    });
  }, [defaultCourier, orders, isEditable]);
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

  const renderCourierCell = (order: ShippingOrder) => {
    if (isEditable) {
      return (
        <Select
          value={inputs[order.id]?.courier ?? ''}
          onValueChange={(value) =>
            setInputs((prev) => ({
              ...prev,
              [order.id]: {
                ...prev[order.id],
                courier: value as CourierCode,
                isAutoFilledCourier: false,
              },
            }))
          }
        >
          <SelectTrigger size="sm" className="w-32 mx-auto">
            <SelectValue placeholder="택배사 선택" />
          </SelectTrigger>
          <SelectContent>
            {COURIERS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return <span className="text-sm text-gray-600 whitespace-nowrap">{order.courier}</span>;
  };

  const renderTrackingCell = (order: ShippingOrder) => {
    if (isEditable) {
      return (
        <Input
          type="number"
          value={inputs[order.id]?.trackingNumber ?? ''}
          onChange={(e) =>
            setInputs((prev) => ({
              ...prev,
              [order.id]: { ...prev[order.id], trackingNumber: e.target.value },
            }))
          }
          placeholder="운송장번호 입력"
          className="w-36 mx-auto whitespace-nowrap [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      );
    }

    return <span className="text-sm text-gray-600 whitespace-nowrap">{order.trackingNumber}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
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

        {isEditable && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">기본 택배사</span>
            <Select
              value={defaultCourier}
              onValueChange={(value) => setDefaultCourier(value as CourierCode)}
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue placeholder="택배사 선택" />
              </SelectTrigger>
              <SelectContent>
                {COURIERS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center whitespace-nowrap">주문번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문일시</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문자</TableHead>
              <TableHead className="text-center">상품명</TableHead>
              <TableHead className="text-center whitespace-nowrap">택배사</TableHead>
              <TableHead className="text-center whitespace-nowrap">운송장번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">발송일</TableHead>
              <TableHead className="text-center whitespace-nowrap">배송완료일</TableHead>
              <TableHead className="text-center whitespace-nowrap">상태</TableHead>
              {hasActionColumn && (
                <TableHead className="text-center whitespace-nowrap">관리</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={hasActionColumn ? 10 : 9}
                  className="text-center py-16 text-gray-400 text-sm"
                >
                  목록을 불러오는 중...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasActionColumn ? 10 : 9}
                  className="text-center py-16 text-gray-400 text-sm"
                >
                  {EMPTY_MESSAGE[status]}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center text-sm font-mono text-gray-500 whitespace-nowrap">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                      {order.customer}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.products[0]?.name}
                      >
                        {order.products[0]?.name}
                        {order.products.length > 1 && (
                          <span className="text-gray-500"> 외 {order.products.length - 1}건</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {renderCourierCell(order)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {renderTrackingCell(order)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    {hasActionColumn && (
                      <TableCell className="text-center whitespace-nowrap">
                        {isEditable && (
                          <Button size="sm" onClick={() => handleConfirm(order.id)}>
                            저장
                          </Button>
                        )}
                        {isShipping && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStatusChange(order.id, '배송완료')}
                          >
                            배송완료 처리
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <EmptyRows count={10 - orders.length} colSpan={hasActionColumn ? 10 : 9} />
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

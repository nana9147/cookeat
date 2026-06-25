'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPageNumbers } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { PaymentInfoTableProps, ShippingStatus } from '@/types/seller/shipping';
import DateRangeFilter from '@/app/seller/components/DateRangeFilter';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PaymentInfoTable({
  orders,
  search,
  onSearchChange,
  onStatusChange,
  onBulkSuccess,
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
}: PaymentInfoTableProps) {
  const actionLabel = '발주확인';
  const nextStatus: ShippingStatus = '배송준비';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [orders]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map((o) => o.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) {
      toast.error('선택된 주문이 없습니다.');
      return;
    }

    setIsBulkProcessing(true);
    try {
      const res = await api.patch('/seller/shipping/orders/bulk-status', {
        orderIds: selectedIds,
        status: nextStatus,
      });
      const { results, successCount, failCount } = res.data.data;

      if (failCount > 0) {
        toast.error(`${successCount}건 처리 완료, ${failCount}건 실패했습니다.`);
      } else {
        toast.success(`${successCount}건이 일괄 발주확인되었습니다.`);
      }

      const succeededIds = results
        .filter((r: { orderId: string; success: boolean }) => r.success)
        .map((r: { orderId: string }) => r.orderId);

      onBulkSuccess(succeededIds);
      setSelectedIds([]);
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '일괄 처리에 실패했습니다.');
    } finally {
      setIsBulkProcessing(false);
    }
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
        <Button
          size="sm"
          disabled={selectedIds.length === 0 || isBulkProcessing}
          onClick={handleBulkConfirm}
        >
          일괄 발주확인 {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">주문번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문일시</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문자</TableHead>
              <TableHead className="text-center whitespace-nowrap">수령인</TableHead>
              <TableHead className="text-center whitespace-nowrap">연락처</TableHead>
              <TableHead className="text-center">배송지</TableHead>
              <TableHead className="text-center">상품명</TableHead>
              <TableHead className="text-center">배송메모</TableHead>
              <TableHead className="text-center whitespace-nowrap">결제금액</TableHead>
              <TableHead className="text-center whitespace-nowrap">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-16 text-gray-400 text-sm">
                  목록을 불러오는 중...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-16 text-gray-400 text-sm">
                  결제완료된 주문건이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={(e) => handleSelect(order.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono text-gray-500 whitespace-nowrap">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                      {order.customer}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                      {order.recipient}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">
                      {order.phone}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      <span
                        className="block max-w-[200px] truncate mx-auto"
                        title={`${order.address} ${order.addressDetail}`}
                      >
                        {order.address}, {order.addressDetail}
                      </span>
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
                    <TableCell className="text-center text-sm text-gray-500">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.shippingRequest || '-'}
                      >
                        {order.shippingRequest || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                      {order.finalAmount.toLocaleString()}원
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Button size="sm" onClick={() => onStatusChange(order.id, nextStatus)}>
                        {actionLabel}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <EmptyRows count={10 - orders.length} colSpan={11} />
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

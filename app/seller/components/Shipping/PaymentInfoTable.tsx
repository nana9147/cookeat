'use client';

import { Button } from '@/components/ui/button';
import { formatDateTime, getPageNumbers } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { PaymentInfoTableProps, ShippingStatus } from '@/types/seller/shipping';
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
  total,
  onStatusChange,
  onBulkSuccess,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: PaymentInfoTableProps) {
  const actionLabel = '발주확인';
  const nextStatus: ShippingStatus = '배송준비';

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const uniqueOrderIds = [...new Set(orders.map((o) => o.orderId))];
  const selectedItemCount = orders.filter((o) => selectedOrderIds.includes(o.orderId)).length;

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [orders]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrderIds(checked ? uniqueOrderIds : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleBulkConfirm = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error('선택된 주문이 없습니다.');
      return;
    }

    const itemIds = orders.filter((o) => selectedOrderIds.includes(o.orderId)).map((o) => o.itemId);

    setIsBulkProcessing(true);
    try {
      const res = await api.patch('/seller/shipping/orders/bulk-status', {
        itemIds,
        status: nextStatus,
      });
      const { successCount, failCount } = res.data.data;

      if (failCount > 0) {
        toast.error(`${successCount}건 처리 완료, ${failCount}건 실패했습니다.`);
      } else {
        toast.success(`${successCount}건이 일괄 발주확인되었습니다.`);
      }

      onBulkSuccess(selectedOrderIds);
      setSelectedOrderIds([]);
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
        <p className="text-sm text-gray-500">
  상품 <span className="font-semibold text-gray-800">{total}</span>개
</p>
        <Button
          size="sm"
          disabled={selectedOrderIds.length === 0 || isBulkProcessing}
          onClick={handleBulkConfirm}
        >
          일괄 발주확인 {selectedItemCount > 0 && `(${selectedItemCount})`}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedOrderIds.length === uniqueOrderIds.length && uniqueOrderIds.length > 0
                  }
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
              <TableHead className="text-center whitespace-nowrap">수량</TableHead>
              <TableHead className="text-center">배송메모</TableHead>
              <TableHead className="text-center whitespace-nowrap">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-16 text-gray-400 text-sm">
                  목록을 불러오는 중...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-16 text-gray-400 text-sm">
                  결제완료된 주문건이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {orders.map((order) => (
                  <TableRow key={order.itemId}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.orderId)}
                        onChange={(e) => handleSelectOrder(order.orderId, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono text-gray-500 whitespace-nowrap">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(order.orderDate)}
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
                        title={order.productName}
                      >
                        {order.productName}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.shippingRequest || '-'}
                      >
                        {order.shippingRequest || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Button size="sm" onClick={() => onStatusChange(order.orderId, nextStatus)}>
                        {actionLabel}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <EmptyRows count={10 - orders.length} colSpan={10} />
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

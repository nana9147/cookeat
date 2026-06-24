'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPageNumbers } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { PaymentInfoTableProps, ShippingStatus } from '@/types/seller/shipping';
import DateRangeFilter from './DateRangeFilter';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

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
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3.5 text-center w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                주문번호
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                주문일시
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                주문자
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                수령인
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                연락처
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
                배송지
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
                상품명
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
                배송메모
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                결제금액
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center py-16 text-gray-400 text-sm">
                  목록을 불러오는 중...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-16 text-gray-400 text-sm">
                  결제완료된 주문건이 없습니다.
                </td>
              </tr>
            ) : (
              <>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-b-0">
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={(e) => handleSelect(order.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 text-center font-mono whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 text-center whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-800 text-center whitespace-nowrap">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-800 text-center whitespace-nowrap">
                      {order.recipient}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 text-center whitespace-nowrap">
                      {order.phone}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 text-center">
                      <span
                        className="block max-w-[200px] truncate mx-auto"
                        title={`${order.address} ${order.addressDetail}`}
                      >
                        {order.address}, {order.addressDetail}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.products[0]?.name}
                      >
                        {order.products[0]?.name}
                        {order.products.length > 1 && (
                          <span className="text-gray-500"> 외 {order.products.length - 1}건</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 text-center">
                      <span
                        className="block max-w-[160px] truncate mx-auto"
                        title={order.shippingRequest || '-'}
                      >
                        {order.shippingRequest || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-800 text-center whitespace-nowrap">
                      {order.finalAmount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Button size="sm" onClick={() => onStatusChange(order.id, nextStatus)}>
                        {actionLabel}
                      </Button>
                    </td>
                  </tr>
                ))}
                <EmptyRows count={10 - orders.length} colSpan={11} />
              </>
            )}
          </tbody>
        </table>
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

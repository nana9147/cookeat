'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourierCode, ShippingOrder, ShippingTableProps } from '@/types/seller/shipping';
import { useState } from 'react';

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

type InputState = {
  courier: string;
  trackingNumber: string;
  isEditing: boolean;
};

export default function ShippingTable({
  orders,
  search,
  onSearchChange,
  onUpdate,
}: ShippingTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, InputState>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    orders,
    10
  );

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    checked ? setSelectedIds(paginated.map((o) => o.id)) : setSelectedIds([]);
  };

  // 개별 선택/해제
  const handleSelect = (id: string, checked: boolean) => {
    checked
      ? setSelectedIds((prev) => [...prev, id])
      : setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleEdit = (order: ShippingOrder) => {
    setInputs((prev) => ({
      ...prev,
      [order.id]: {
        courier: order.courier,
        trackingNumber: order.trackingNumber,
        isEditing: true,
      },
    }));
  };

  const handleConfirm = (orderId: string) => {
    const input = inputs[orderId];

    if (!input?.courier && !input?.trackingNumber) {
      setErrorMessage('택배사와 운송장번호를 모두 입력해주세요.');
      setIsErrorOpen(true);
      return;
    }
    if (!input?.courier) {
      setErrorMessage('택배사를 선택해주세요.');
      setIsErrorOpen(true);
      return;
    }
    if (!input?.trackingNumber) {
      setErrorMessage('운송장번호를 입력해주세요.');
      setIsErrorOpen(true);
      return;
    }

    // TODO: API 연동
    console.log('배송 처리:', orderId, input);
    onUpdate(orderId, input.courier, input.trackingNumber);
    setInputs((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], isEditing: false },
    }));
  };

  const renderCourierCell = (order: ShippingOrder) => {
    const isNew = !order.courier;
    const isEditing = inputs[order.id]?.isEditing ?? false;

    if (isNew || isEditing) {
      return (
        <Select
          value={inputs[order.id]?.courier ?? ''}
          onValueChange={(value) =>
            setInputs((prev) => ({
              ...prev,
              [order.id]: { ...prev[order.id], courier: value },
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

    return <span className="text-sm text-gray-600">{order.courier}</span>;
  };

  const renderTrackingCell = (order: ShippingOrder) => {
    const isNew = !order.courier;
    const isEditing = inputs[order.id]?.isEditing ?? false;

    if (isNew || isEditing) {
      return (
        <Input
          value={inputs[order.id]?.trackingNumber ?? ''}
          onChange={(e) =>
            setInputs((prev) => ({
              ...prev,
              [order.id]: { ...prev[order.id], trackingNumber: e.target.value },
            }))
          }
          placeholder="운송장번호 입력"
          className="w-36 mx-auto"
        />
      );
    }

    return <span className="text-sm text-gray-600">{order.trackingNumber}</span>;
  };

  const renderActionCell = (order: ShippingOrder) => {
    const isNew = !order.courier;
    const isEditing = inputs[order.id]?.isEditing ?? false;

    if (isNew || isEditing) {
      return (
        <Button size="sm" onClick={() => handleConfirm(order.id)}>
          저장
        </Button>
      );
    }

    return (
      <Button size="sm" variant="outline" onClick={() => handleEdit(order)}>
        수정
      </Button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 검색 + 일괄처리 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="주문번호, 주문자로 검색"
          className="w-64 bg-card"
        />
        <Button size="sm">일괄 배송처리</Button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600 w-10">
              <input
                type="checkbox"
                checked={selectedIds.length === paginated.length && paginated.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              주문번호
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">주문자</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">상품명</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">택배사</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              운송장번호
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">상태</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">관리</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                주문내역이 없습니다.
              </td>
            </tr>
          ) : (
            <>
              {paginated.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={(e) => handleSelect(order.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 text-center font-mono">
                    {order.id}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.products[0]}
                    {order.products.length > 1 && (
                      <span className="text-gray-500"> 외 {order.products.length - 1}건</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">{renderCourierCell(order)}</td>
                  <td className="px-4 py-3.5 text-center">{renderTrackingCell(order)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">{renderActionCell(order)}</td>
                </tr>
              ))}
              {Array.from({ length: 10 - paginated.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td colSpan={8} className="py-[30.5px]" />
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getPageNumbers={getPageNumbers}
      />
      {/* 에러 Dialog */}
      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입력 오류</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">{errorMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsErrorOpen(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { formatDateTime, getPageNumbers } from '@/lib/utils';
import { RefundTableProps, RefundItem } from '@/types/seller/order';
import StatusBadge from '../StatusBadge';

const COURIERS = [
  'CJ대한통운',
  '로젠택배',
  '한진택배',
  '롯데택배',
  '우체국택배',
  'CU 편의점택배',
  'GS25 편의점택배',
  'ETC',
];

export default function RefundTable({
  orders,
  onApprove,
  onProcess,
  onReject,
  onSaveTracking,
  selectedIds,
  isAllSelectedMode,
  onSelect,
  onSelectAll,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: RefundTableProps) {
  const [viewingReasonItem, setViewingReasonItem] = useState<RefundItem | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<
    Record<number, { courier: string; trackingNumber: string }>
  >({});
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const rows = orders.flatMap((order) => order.refundItems.map((item) => ({ order, item })));

  const handleSaveClick = (refundId: number) => {
    const input = trackingInputs[refundId];
    if (!input?.courier || !input?.trackingNumber) {
      return;
    }
    onSaveTracking(refundId, input.courier, input.trackingNumber);
  };

  const renderReturnTrackingCell = (item: RefundItem) => {
    if (item.returnCourier && item.returnTrackingNumber) {
      return (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {item.returnCourier} / {item.returnTrackingNumber}
        </span>
      );
    }

    if (item.itemStatus === '환불진행중' && !isAdmin) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <Select
            value={trackingInputs[item.refundId]?.courier ?? ''}
            onValueChange={(value) =>
              setTrackingInputs((prev) => ({
                ...prev,
                [item.refundId]: { ...prev[item.refundId], courier: value },
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
            value={trackingInputs[item.refundId]?.trackingNumber ?? ''}
            onChange={(e) =>
              setTrackingInputs((prev) => ({
                ...prev,
                [item.refundId]: { ...prev[item.refundId], trackingNumber: e.target.value },
              }))
            }
            placeholder="운송장번호"
            className="w-28 whitespace-nowrap"
          />
          <Button size="sm" variant="outline" onClick={() => handleSaveClick(item.refundId)}>
            저장
          </Button>
        </div>
      );
    }

    return <span className="text-gray-400 text-sm">-</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-10">
                <input
                  type="checkbox"
                  checked={
                    isAllSelectedMode || (selectedIds.length === rows.length && rows.length > 0)
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">주문번호</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문일</TableHead>
              <TableHead className="text-center whitespace-nowrap">주문자</TableHead>
              <TableHead className="text-center">상품명</TableHead>
              <TableHead className="text-center whitespace-nowrap">수량</TableHead>
              <TableHead className="text-center whitespace-nowrap">금액</TableHead>
              <TableHead className="text-center whitespace-nowrap">배송상태</TableHead>
              <TableHead className="text-center whitespace-nowrap">신청일</TableHead>
              <TableHead className="text-center whitespace-nowrap">처리일</TableHead>
              <TableHead className="text-center whitespace-nowrap">반송택배사/운송장</TableHead>
              <TableHead className="text-center whitespace-nowrap">사유</TableHead>
              <TableHead className="text-center whitespace-nowrap">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-16 text-gray-400 text-sm">
                  목록을 불러오는 중...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-16 text-gray-400 text-sm">
                  취소·환불 요청이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map(({ order, item }) => {
                  const isRejected = Boolean(item.refundRejectReason);
                  const isPending =
                    (item.itemStatus === '환불요청' || item.itemStatus === '취소요청') &&
                    !isRejected;
                  const isProcessing = item.itemStatus === '환불진행중';
                  const rejectedLabel = item.itemStatus === '취소요청' ? '취소거부' : '환불거부';

                  return (
                    <TableRow
                      key={item.refundId}
                      className={
                        isPending ? 'bg-amber-50' : isProcessing ? 'bg-blue-50' : undefined
                      }
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelectedMode || selectedIds.includes(item.refundId)}
                          onChange={(e) => onSelect(item.refundId, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="text-center text-sm font-mono text-gray-500 whitespace-nowrap">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(order.orderDate)}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                        {order.customer}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                        <span
                          className="block max-w-[160px] truncate mx-auto"
                          title={item.productName}
                        >
                          {item.productName}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">
                        {item.quantity}개
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-800 whitespace-nowrap">
                        {(item.quantity * item.unitPrice).toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={order.orderStatus} />
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(item.requestedAt)}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500 whitespace-nowrap">
                        {item.processedAt ? formatDateTime(item.processedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {renderReturnTrackingCell(item)}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {item.refundRequestReason || item.refundRejectReason ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingReasonItem(item)}
                          >
                            사유 보기
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {isPending && !isAdmin ? (
                          <div className="flex gap-1.5 justify-center">
                            <Button size="sm" onClick={() => onApprove(item.refundId)}>
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReject(item.refundId)}
                            >
                              거부
                            </Button>
                          </div>
                        ) : isProcessing && !isAdmin ? (
                          <Button size="sm" onClick={() => onProcess(item.refundId)}>
                            환불처리
                          </Button>
                        ) : isPending || isProcessing ? (
                          <StatusBadge status={item.itemStatus} />
                        ) : isRejected ? (
                          <StatusBadge status={rejectedLabel} />
                        ) : (
                          <StatusBadge status={item.itemStatus} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <EmptyRows count={10 - rows.length} colSpan={13} />
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

      <Dialog
        open={viewingReasonItem !== null}
        onOpenChange={(open) => !open && setViewingReasonItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingReasonItem?.productName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-sm">
            {viewingReasonItem?.refundRequestReason && (
              <div>
                <p className="text-gray-500 mb-1">요청 사유</p>
                <p className="text-gray-800 bg-gray-50 rounded-md p-3">
                  {viewingReasonItem.refundRequestReason}
                </p>
              </div>
            )}
            {viewingReasonItem?.refundRejectReason && (
              <div>
                <p className="text-gray-500 mb-1">거부 사유</p>
                <p className="text-gray-800 bg-gray-50 rounded-md p-3">
                  {viewingReasonItem.refundRejectReason}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

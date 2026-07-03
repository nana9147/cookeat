'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import BackButton from '../../../components/BackButton';
import { useAuthStore } from '@/store/authStore';
import { formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABEL } from '@/types/seller/order';
import type { OrderWithRefunds, RefundItem } from '@/types/seller/order';
import api from '@/lib/api';
import { toast } from 'sonner';

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

export default function RefundDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const [order, setOrder] = useState<OrderWithRefunds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingRefundId, setRejectingRefundId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<
    Record<number, { courier: string; trackingNumber: string }>
  >({});

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/seller/orders/refunds/order/${orderId}`);
      setOrder(res.data.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '환불 상세를 불러오지 못했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const handleApprove = async (refundId: number) => {
    try {
      const res = await api.patch(`/seller/orders/refunds/${refundId}`, { action: 'approve' });
      const resultStatus = res.data.data.status;
      const particle = resultStatus === '환불' ? '이' : '가';
      toast.success(`${resultStatus}${particle} 승인되었습니다.`);
      fetchDetail();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '승인에 실패했습니다.');
    }
  };

  const handleProcess = async (refundId: number) => {
    try {
      await api.patch(`/seller/orders/refunds/${refundId}`, { action: 'process' });
      toast.success('환불 처리가 완료되었습니다.');
      fetchDetail();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '환불 처리에 실패했습니다.');
    }
  };

  const handleSaveTracking = async (refundId: number) => {
    const input = trackingInputs[refundId];
    if (!input?.courier || !input?.trackingNumber) return;
    try {
      await api.patch(`/seller/orders/refunds/${refundId}`, {
        action: 'saveTracking',
        courier: input.courier,
        trackingNumber: input.trackingNumber,
      });
      toast.success('반송 운송장이 저장되었습니다.');
      fetchDetail();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '저장에 실패했습니다.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRefundId) return;
    if (!rejectReason.trim()) {
      toast.error('거부 사유를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.patch(`/seller/orders/refunds/${rejectingRefundId}`, {
        action: 'reject',
        reason: rejectReason,
      });
      const resultStatus = res.data.data.status;
      const baseStatus = resultStatus.replace('요청', '');
      const particle = baseStatus === '환불' ? '을' : '를';
      toast.success(`${baseStatus}${particle} 거부했습니다.`);
      setRejectingRefundId(null);
      fetchDetail();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '거부 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background p-8">
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text">환불 상세내역</h1>
        </div>
        <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-background p-8">
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text">환불 상세내역</h1>
        </div>
        <div className="text-center py-16 text-gray-400 text-sm">환불 내역을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const totalRefundAmount = order.refundItems.reduce((sum, item) => sum + item.refundAmount, 0);
  const totalPointAmount = order.refundItems.reduce((sum, item) => sum + item.allocatedPoint, 0);

  return (
    <div className="bg-background p-8">
      <div className="flex items-center gap-2 mb-8">
        <BackButton />
        <h1 className="text-h2 font-bold text-dark-text">환불 상세내역</h1>
      </div>

      {/* 주문 메타 정보 */}
      <div className="flex items-end justify-between pb-5 mb-2 border-b border-gray-200">
        <div>
          <p className="text-xl font-bold text-dark-text">{formatDateTime(order.orderDate)}</p>
          <p className="text-sm text-gray-500 mt-1">
            주문번호 {order.id} · {order.customer}
          </p>
        </div>
        <Link
          href={`/seller/orders/${order.id}`}
          className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-800"
        >
          주문 상세보기
        </Link>
      </div>

      {/* 총 환불예정금액 요약 */}
      <div className="flex justify-end mb-8">
        <div className="text-right">
          <p className="text-xs text-gray-400">총 환불예정금액</p>
          <p className="text-lg font-bold text-dark-text">
            {totalRefundAmount.toLocaleString()}원
            {totalPointAmount > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-1.5">
                (+ 포인트 {totalPointAmount.toLocaleString()}P 별도 환급)
              </span>
            )}
          </p>
        </div>
      </div>

      <p className="text-sm font-semibold text-dark-text mb-4">
        환불·취소 상품 {order.refundItems.length}개
      </p>

      <div className="flex flex-col gap-6">
        {order.refundItems.map((item) => (
          <RefundItemRow
            key={item.refundId}
            item={item}
            isAdmin={isAdmin}
            trackingInput={trackingInputs[item.refundId]}
            onTrackingChange={(value) =>
              setTrackingInputs((prev) => ({ ...prev, [item.refundId]: value }))
            }
            onApprove={() => handleApprove(item.refundId)}
            onReject={() => setRejectingRefundId(item.refundId)}
            onProcess={() => handleProcess(item.refundId)}
            onSaveTracking={() => handleSaveTracking(item.refundId)}
          />
        ))}
      </div>

      <Dialog
        open={rejectingRefundId !== null}
        onOpenChange={(open) => !open && setRejectingRefundId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 요청 거부</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="거부 사유를 입력해주세요"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingRefundId(null)}>
              취소
            </Button>
            <Button onClick={handleRejectSubmit} disabled={isSubmitting}>
              거부 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefundItemRow({
  item,
  isAdmin,
  trackingInput,
  onTrackingChange,
  onApprove,
  onReject,
  onProcess,
  onSaveTracking,
}: {
  item: RefundItem;
  isAdmin: boolean;
  trackingInput?: { courier: string; trackingNumber: string };
  onTrackingChange: (value: { courier: string; trackingNumber: string }) => void;
  onApprove: () => void;
  onReject: () => void;
  onProcess: () => void;
  onSaveTracking: () => void;
}) {
  const isRejected = Boolean(item.refundRejectReason);
  const isPending =
    (item.itemStatus === '환불요청' || item.itemStatus === '취소요청') && !isRejected;
  const isProcessing = item.itemStatus === '환불진행중';
  const statusLabel = isRejected
    ? item.itemStatus === '취소요청'
      ? '취소거부'
      : '환불거부'
    : ORDER_STATUS_LABEL[item.itemStatus];

  return (
    <div className="border-b border-gray-100 pb-6">
      <p className="text-sm font-medium text-gray-600 mb-3">{statusLabel}</p>

      {/* 가로 배치: 상품 정보 | 환불 금액 | 신청 정보 | 반송 정보 | 관리 */}
      <div className="flex items-start gap-8">
        {/* 상품 정보 */}
        <div className="flex gap-3 w-64 flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {item.img && (
              <Image src={item.img} alt={item.productName} fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-text truncate">{item.productName}</p>
            <p className="text-sm text-gray-500 mt-1">{item.quantity}개</p>
          </div>
        </div>

        {/* 환불 금액 */}
        <div className="w-48 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 mb-2">환불 금액</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">정상가</span>
              <span className="text-gray-500">
                {(item.originalUnitPrice * item.quantity).toLocaleString()}원
              </span>
            </div>
            {item.productDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">상품할인</span>
                <span className="text-red-500">-{item.productDiscount.toLocaleString()}원</span>
              </div>
            )}
            {item.couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">쿠폰할인</span>
                <span className="text-red-500">-{item.couponDiscount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-700 font-medium">환급액</span>
              <span className="text-dark-text font-semibold">
                {item.refundAmount.toLocaleString()}원
              </span>
            </div>
            {item.allocatedPoint > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">포인트 환급</span>
                <span className="text-blue-500">{item.allocatedPoint.toLocaleString()}P</span>
              </div>
            )}
          </div>
        </div>

        {/* 신청 정보 */}
        <div className="w-48 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 mb-2">신청 정보</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">신청 일시</span>
              <span className="text-gray-700">{formatDateTime(item.requestedAt)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">완료 일시</span>
              <span className="text-gray-700">
                {item.processedAt ? formatDateTime(item.processedAt) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 반송 정보 */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 mb-2">반송 정보</p>
          {item.returnCourier && item.returnTrackingNumber ? (
            <p className="text-sm text-gray-600">
              {item.returnCourier} / {item.returnTrackingNumber}
            </p>
          ) : isProcessing && !isAdmin ? (
            <div className="flex items-center gap-1.5">
              <Select
                value={trackingInput?.courier ?? ''}
                onValueChange={(value) =>
                  onTrackingChange({
                    courier: value,
                    trackingNumber: trackingInput?.trackingNumber ?? '',
                  })
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
                value={trackingInput?.trackingNumber ?? ''}
                onChange={(e) =>
                  onTrackingChange({
                    courier: trackingInput?.courier ?? '',
                    trackingNumber: e.target.value,
                  })
                }
                placeholder="운송장번호"
                className="w-28"
              />
              <Button size="sm" variant="outline" onClick={onSaveTracking}>
                저장
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">-</p>
          )}
        </div>

        {/* 관리 */}
        <div className="w-40 flex-shrink-0 flex justify-end gap-2">
          {!isAdmin && isPending && (
            <>
              <Button size="sm" onClick={onApprove}>
                승인
              </Button>
              <Button size="sm" variant="outline" onClick={onReject}>
                거부
              </Button>
            </>
          )}
          {!isAdmin && isProcessing && (
            <Button size="sm" onClick={onProcess}>
              환불처리
            </Button>
          )}
        </div>
      </div>

      {/* 사유: 길어질 수 있어서 아래 줄로 분리 */}
      {(item.refundRequestReason || item.refundRejectReason) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5 text-sm">
          {item.refundRequestReason && (
            <div className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">요청 사유</span>
              <span className="text-gray-700">{item.refundRequestReason}</span>
            </div>
          )}
          {item.refundRejectReason && (
            <div className="flex gap-2">
              <span className="text-gray-400 flex-shrink-0">거부 사유</span>
              <span className="text-gray-700">{item.refundRejectReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

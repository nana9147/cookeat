'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function OrderCancelModal({ orderId, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason: reason.trim() || undefined });
      toast.success('취소 신청이 접수되었습니다.');
      onSuccess();
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      toast.error(message ?? '취소 신청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="font-bold text-dark-text">취소 신청</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-xs text-gray-text">취소 사유를 입력해주세요. (선택)</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="예: 단순 변심"
          />
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-10 rounded-xl bg-red text-white text-sm font-medium hover:bg-red/90 transition-colors disabled:opacity-50"
          >
            {submitting ? '신청 중...' : '취소 신청'}
          </button>
        </div>
      </div>
    </div>
  );
}

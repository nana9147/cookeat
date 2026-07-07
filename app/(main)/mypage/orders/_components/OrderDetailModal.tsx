'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';
import type { OrderDetail } from './types';
import OrderDetailContent from './OrderDetailContent';

type Props = { orderId: string; onClose: () => void };

export default function OrderDetailModal({ orderId, onClose }: Props) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<OrderDetail>(`/orders/${orderId}`)
      .then(({ data }) => { if (!cancelled) setDetail(data); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90dvh] flex flex-col shadow-xl">

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <h2 className="font-bold text-dark-text">주문 상세</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>

        <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4 pb-8 flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-beige animate-pulse" />)}
            </div>
          ) : !detail ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-text">주문 정보를 불러오지 못했습니다.</p>
            </div>
          ) : (
            <OrderDetailContent detail={detail} />
          )}
        </div>

      </div>
    </div>
  );
}

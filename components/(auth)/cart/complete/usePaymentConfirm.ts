'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import type { OrderDetail } from './types';

type Status = 'loading' | 'success' | 'fail';

export function usePaymentConfirm(
  paymentKey: string | null,
  pgToken: string | null,
  orderId: string | null,
  amount: number,
) {
  const [status, setStatus] = useState<Status>(paymentKey || pgToken ? 'loading' : 'fail');
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const clearCart = useCartStore((s) => s.clear);
  const initRef = useRef({ paymentKey, pgToken, orderId, amount });

  useEffect(() => {
    const { paymentKey, pgToken, orderId, amount } = initRef.current;

    const cleanKakao = () => {
      sessionStorage.removeItem('kakaoTid');
      sessionStorage.removeItem('kakaoOrderId');
    };

    const confirmAndFetch = async (confirmFn: () => Promise<void>) => {
      try {
        await confirmFn();
        if (orderId) {
          const { data } = await api.get<OrderDetail>(`/order/${orderId}`);
          setOrderDetail(data);
        }
        setStatus('success');
        clearCart();
      } catch {
        cleanKakao();
        setStatus('fail');
      }
    };

    if (paymentKey) {
      confirmAndFetch(() =>
        api
          .post('/payment/toss/confirm', { paymentKey, orderId, amount })
          .then(({ data }) => {
            if (data.status !== 'DONE') throw new Error('결제 실패');
          }),
      );
      return;
    }

    if (pgToken) {
      const tid = sessionStorage.getItem('kakaoTid');
      confirmAndFetch(() =>
        api
          .post('/payment/kakao/approve', { tid, pgToken, orderId })
          .then(({ data }) => {
            cleanKakao();
            if (!data.tid) throw new Error('결제 실패');
          }),
      );
    }
  // clearCart만 의존 — paymentKey 등은 initRef로 마운트 시 1회만 실행
  }, [clearCart]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, orderDetail };
}

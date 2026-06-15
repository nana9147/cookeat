'use client';

import api from '@/lib/api';

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

type TossWindow = Window & {
  TossPayments?: (key: string) => {
    requestPayment: (method: string, params: Record<string, unknown>) => void;
  };
};

async function loadTossV1() {
  const w = window as TossWindow;
  if (!w.TossPayments) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Toss 스크립트 로드 실패'));
      document.head.appendChild(script);
    });
  }
  return (window as TossWindow).TossPayments!(TOSS_CLIENT_KEY);
}

export function useCheckoutPayment(paymentMethod: string, finalAmount: number) {
  return async () => {
    try {
      const { data: order } = await api.post<{ orderId: string; finalAmount: number }>('/order', {
        finalAmount,
        paymentMethod,
      });
      const { orderId, finalAmount: confirmedAmount } = order;

      if (paymentMethod === 'kakao') {
        try {
          const { data } = await api.post<{ tid: string; redirectUrl: string }>('/payment/kakao/ready', {
            orderId, itemName: 'Cookeat 주문', quantity: 1, totalAmount: confirmedAmount,
          });
          sessionStorage.setItem('kakaoTid', data.tid);
          sessionStorage.setItem('kakaoOrderId', orderId);
          window.location.href = data.redirectUrl;
        } catch (err) {
          alert(`카카오페이 오류: ${(err as Error).message}`);
        }
        return;
      }

      if (paymentMethod === 'card' || paymentMethod === 'toss') {
        const toss = await loadTossV1();
        toss.requestPayment(paymentMethod === 'card' ? '카드' : '토스페이', {
          amount: confirmedAmount, orderId, orderName: 'Cookeat 주문',
          successUrl: `${window.location.origin}/cart/complete`,
          failUrl: `${window.location.origin}/cart/checkout`,
        });
        return;
      }

      alert('해당 결제 수단은 준비 중입니다.');
    } catch (err) {
      alert(`결제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
}

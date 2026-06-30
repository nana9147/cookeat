'use client';

import { toast } from 'sonner';
import api from '@/lib/api';
import type { CartStoreItem } from '@/store/cartStore';

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

const ALLOWED_KAKAO_HOSTS = ['kauth.kakao.com', 'pg.pay.kakao.com', 'online-pay.kakao.com'];

interface DeliveryInfo {
  recipient: string;
  phone: string;
  address: string;
  addressDetail: string | null;
}

export function useCheckoutPayment(
  paymentMethod: string,
  cartItems: CartStoreItem[],
  deliveryInfo: DeliveryInfo | null
) {
  return async () => {
    if (cartItems.length === 0) {
      toast.warning('장바구니가 비어있습니다.');
      return;
    }
    try {
      const { data: order } = await api.post<{ orderId: string; finalAmount: number }>('/order', {
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        recipient: deliveryInfo?.recipient ?? '',
        phone: deliveryInfo?.phone ?? '',
        address: deliveryInfo?.address ?? '',
        addressDetail: deliveryInfo?.addressDetail ?? null,
      });
      const { orderId, finalAmount } = order;

      if (paymentMethod === 'kakao') {
        const { data } = await api.post<{ tid: string; redirectUrl: string }>(
          '/payment/kakao/ready',
          { orderId, itemName: 'Cookeat 주문', quantity: 1, totalAmount: finalAmount }
        );
        const redirectUrl = new URL(data.redirectUrl);
        if (!ALLOWED_KAKAO_HOSTS.includes(redirectUrl.hostname)) {
          toast.error('유효하지 않은 결제 URL입니다.');
          return;
        }
        sessionStorage.setItem('kakaoTid', data.tid);
        sessionStorage.setItem('kakaoOrderId', orderId);
        window.location.href = data.redirectUrl;
        return;
      }

      if (paymentMethod === 'card' || paymentMethod === 'toss') {
        const toss = await loadTossV1();
        toss.requestPayment(paymentMethod === 'card' ? '카드' : '토스페이', {
          amount: finalAmount,
          orderId,
          orderName: 'Cookeat 주문',
          successUrl: `${window.location.origin}/cart/complete`,
          failUrl: `${window.location.origin}/cart/checkout`,
        });
        return;
      }

      toast.warning('해당 결제 수단은 준비 중입니다.');
    } catch (err) {
      toast.error(`결제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
}

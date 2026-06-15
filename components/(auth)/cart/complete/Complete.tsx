'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CartStepper from '@/components/(auth)/cart/CartStepper';
import PaymentResult from './PaymentResult';
import api from '@/lib/api';

type Status = 'loading' | 'success' | 'fail';
type PaymentType = 'card' | 'kakao' | 'toss' | 'bankbook' | 'mobile';

function resolvePaymentMethod(pgToken: string | null): PaymentType {
  return pgToken ? 'kakao' : 'card';
}

export default function Complete() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const pgToken = searchParams.get('pg_token');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));
  const [status, setStatus] = useState<Status>(paymentKey || pgToken ? 'loading' : 'fail');
  const paymentMethod = resolvePaymentMethod(pgToken);

  useEffect(() => {
    if (paymentKey) {
      api
        .post('/payment/toss/confirm', { paymentKey, orderId, amount })
        .then(({ data }) => setStatus(data.status === 'DONE' ? 'success' : 'fail'))
        .catch(() => setStatus('fail'));
      return;
    }

    if (pgToken) {
      const tid = sessionStorage.getItem('kakaoTid');
      const orderId = sessionStorage.getItem('kakaoOrderId');
      api
        .post('/payment/kakao/approve', { tid, pgToken, orderId, userId: 'test_user' })
        .then(({ data }) => {
          sessionStorage.removeItem('kakaoTid');
          sessionStorage.removeItem('kakaoOrderId');
          setStatus(data.tid ? 'success' : 'fail');
        })
        .catch(() => setStatus('fail'));
    }
  }, [paymentKey, pgToken, orderId, amount]);

  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2
        className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2"
        suppressHydrationWarning
      >
        주문 완료
      </h2>
      <CartStepper />
      <div className="mt-6">
        <PaymentResult status={status} paymentMethod={paymentMethod} />
      </div>
    </div>
  );
}

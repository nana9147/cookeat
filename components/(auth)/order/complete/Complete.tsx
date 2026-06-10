'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CartStepper from '@/components/(auth)/order/CartStepper';
import PaymentResult from './PaymentResult';

type Status = 'loading' | 'success' | 'fail';

export default function Complete() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const pgToken = searchParams.get('pg_token');

    if (paymentKey) {
      fetch('/api/payment/toss/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId: searchParams.get('orderId'), amount: Number(searchParams.get('amount')) }),
      })
        .then((r) => r.json())
        .then((data) => setStatus(data.status === 'DONE' ? 'success' : 'fail'))
        .catch(() => setStatus('fail'));
      return;
    }

    if (pgToken) {
      const tid = sessionStorage.getItem('kakaoTid');
      const orderId = sessionStorage.getItem('kakaoOrderId');
      fetch('/api/payment/kakao/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tid, pgToken, orderId, userId: 'test_user' }),
      })
        .then((r) => r.json())
        .then((data) => {
          sessionStorage.removeItem('kakaoTid');
          sessionStorage.removeItem('kakaoOrderId');
          setStatus(data.tid ? 'success' : 'fail');
        })
        .catch(() => setStatus('fail'));
      return;
    }

    setStatus('fail');
  }, [searchParams]);

  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2 className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2" suppressHydrationWarning>
        결제 완료
      </h2>
      <CartStepper />
      <PaymentResult status={status} />
    </div>
  );
}

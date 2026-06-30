const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
const KAKAO_SECRET_KEY = process.env.KAKAO_SECRET_KEY!;
const KAKAO_CID = process.env.KAKAO_CID ?? 'TC0ONETIME';

export async function cancelPayment(
  paymentMethod: string,
  paymentKey: string,
  cancelAmount: number
): Promise<void> {
  if (paymentMethod === '카드') {
    await cancelTossPayment(paymentKey, cancelAmount);
  } else if (paymentMethod === '카카오페이') {
    await cancelKakaoPayment(paymentKey, cancelAmount);
  } else {
    throw new Error(`지원하지 않는 결제 수단입니다: ${paymentMethod}`);
  }
}

async function cancelTossPayment(paymentKey: string, cancelAmount: number) {
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason: '판매자 환불 승인', cancelAmount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? '카드 결제 취소에 실패했습니다.');
  }
}

async function cancelKakaoPayment(tid: string, cancelAmount: number) {
  const res = await fetch('https://open-api.kakaopay.com/online/v1/payment/cancel', {
    method: 'POST',
    headers: {
      Authorization: `SECRET_KEY ${KAKAO_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cid: KAKAO_CID,
      tid,
      cancel_amount: cancelAmount,
      cancel_tax_free_amount: 0,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? '카카오페이 결제 취소에 실패했습니다.');
  }
}

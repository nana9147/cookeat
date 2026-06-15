import Link from 'next/link';
import { PAYMENT_LABEL, type PaymentType } from './completeData';
import CompleteHeader from './CompleteHeader';
import CompleteOrderInfo from './CompleteOrderInfo';
import CompleteOrderItems from './CompleteOrderItems';
import CompleteNotice from './CompleteNotice';

type Status = 'loading' | 'success' | 'fail';

export default function PaymentResult({
  status,
  paymentMethod = 'card',
}: {
  status: Status;
  paymentMethod?: PaymentType;
}) {
  if (status === 'loading') {
    return <p className="py-20 text-center text-gray-text">결제 확인 중...</p>;
  }

  if (status === 'fail') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-h4 font-bold text-dark-text">결제에 실패했습니다.</p>
        <Link
          href="/cart/checkout"
          className="px-6 py-3 border border-border rounded-xl text-sm text-gray-text hover:bg-hover transition-colors"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CompleteHeader />
      <div className="flex flex-col desktop:flex-row gap-4 desktop:items-stretch">
        <CompleteOrderInfo paymentMethodLabel={PAYMENT_LABEL[paymentMethod]} />
        <CompleteOrderItems />
      </div>
      <CompleteNotice />
    </div>
  );
}

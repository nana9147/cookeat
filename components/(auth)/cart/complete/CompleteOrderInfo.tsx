import PaymentSummary from '@/components/(auth)/cart/PaymentSummary';
import type { OrderDetail } from './types';

export default function CompleteOrderInfo({
  orderDetail,
  paymentMethodLabel,
}: {
  orderDetail: OrderDetail | null;
  paymentMethodLabel: string;
}) {
  const deliveryRows = [
    { label: '수취인', text: orderDetail?.recipient ?? '-' },
    { label: '연락처', text: orderDetail?.phone ?? '-' },
    { label: '주소', text: orderDetail?.address ?? '-' },
  ];

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border p-5 flex flex-col gap-5">
      <section>
        <h3 className="text-h4 font-bold text-dark-text mb-4">배송 정보</h3>
        <div className="flex flex-col gap-2 text-sm">
          {deliveryRows.map(({ label, text }) => (
            <div key={label} className="flex gap-3">
              <span className="text-gray-text w-14 shrink-0">{label}</span>
              <span className="text-dark-text">{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-primary">
          * 새벽 배송의 경우 오늘 14시 이전 결제 시 내일 새벽 배송됩니다.
        </p>
      </section>

      <hr className="border-border" />

      <section>
        <h3 className="text-h4 font-bold text-dark-text mb-4">결제 정보</h3>
        <PaymentSummary
          noCard
          mode="complete"
          paymentMethodLabel={paymentMethodLabel}
          productTotal={orderDetail?.totalAmount ?? 0}
          shippingFee={orderDetail?.shippingFee ?? 0}
          couponDiscount={orderDetail?.couponDiscount ?? 0}
          productDiscount={0}
        />
      </section>
    </div>
  );
}

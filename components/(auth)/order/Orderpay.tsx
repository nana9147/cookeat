import Link from 'next/link';

export default function OrderPay() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h4 className="text-sm font-medium text-dark-text">총 결제 금액</h4>
        <span className="text-2xl font-bold text-primary">35,410원</span>
      </div>
      <p className="text-right text-xs text-gray-text">+ 354P 적립 예정</p>

      <Link
        href="/order/checkout"
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold text-base py-4 rounded-xl text-center flex items-center justify-center gap-1 transition-colors"
      >
        주문하기 &gt;
      </Link>

      <div className="flex items-start gap-1.5 text-xs text-gray-text leading-relaxed">
        <span className="text-primary shrink-0">⊙</span>
        <span>판매자별 무료배송 기준이 상이하며, 오늘 14시 전 결제 시 내일 새벽 도착예정입니다.</span>
      </div>

      <div className="flex flex-col gap-1 text-xs text-gray-text">
        <p>* 레시피 묶음도 판매자가 다른 경우 별도 배송됩니다.</p>
        <p>* 판매자별 배송비는 각 판매자 상품 합계로 계산됩니다.</p>
      </div>
    </div>
  );
}

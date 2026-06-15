import SellerInfo from './SellerInfo';
import OrderPay from './Orderpay';

export default function OrderList() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4">
      <h3 className="text-h5 font-bold text-dark-text">결제 요약</h3>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-text">상품 금액 (8개)</span>
          <span className="text-dark-text font-medium">39,930원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-text">상품 할인</span>
          <span className="text-red font-medium">-1,520원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-text">쿠폰 할인</span>
          <span className="text-red font-medium">-3,000원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-text">배송비</span>
          <span className="text-dark-text font-medium">무료</span>
        </div>
      </div>

      <div className="border-t border-border" />

      <SellerInfo />

      <button className="flex items-center justify-between bg-red/5 border border-red/20 rounded-lg px-3 py-2.5 w-full hover:bg-red/10 transition-colors">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-red flex items-center justify-center shrink-0">
            <span className="text-white text-2xs font-bold">%</span>
          </span>
          <span className="flex flex-col items-start">
            <span className="text-xs font-medium text-dark-text">웰컴 쿠폰 3,000원 적용 중</span>
            <span className="text-xs text-gray-text">사용 가능 쿠폰 3장</span>
          </span>
        </span>
        <span className="text-sm text-gray-text">&gt;</span>
      </button>

      <div className="border-t border-border" />

      <OrderPay />
    </div>
  );
}

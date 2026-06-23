import BackButton from '../../components/BackButton';
import { OrderDetail } from '@/types/seller/order';
import OrderInfoSection from '../../components/OrderDetail/OrderInfoSection';
import OrderProductSection from '../../components/OrderDetail/OrderProductSection';
import OrderPaymentSection from '../../components/OrderDetail/OrderPaymentSection';
import OrderDeliverySection from '../../components/OrderDetail/OrderDeliverySection';

const MOCK_ORDER: OrderDetail = {
  info: {
    id: 'ORD-2026-001234',
    orderDate: '2026-06-02 14:23:45',
    status: '배송준비',
  },
  products: [
    {
      id: 'prod-001',
      itemName: '청양고추 500g',
      quantity: 2,
      unitPrice: 12500,
      itemTotalPrice: 25000,
      img: 'https://images.unsplash.com/photo-1599987141071-f5810d32e21a?q=80&w=1081&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 'prod-002',
      itemName: '유기농 토마토 1kg',
      quantity: 3,
      unitPrice: 18000,
      itemTotalPrice: 54000,
      img: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ],
  payment: {
    totalPrice: 79000,
    shippingFee: 3000,
    couponType: '신규가입 5천원 쿠폰',
    couponAmount: 5000,
    pointAmount: 2000,
    finalAmount: 75000,
    paymentMethod: '신용카드',
  },
  delivery: {
    name: '김철수',
    phone: '010-1234-5678',
    address: {
      originAddress: '서울시 강남구 테헤란로 123',
      detailAddress: '456호',
    },
    memo: '문 앞에 놓아주세요',
  },
};

export default function OrderDetailPage() {
  return (
    <div className="bg-background p-8">
      <div className="flex items-center justify-between gap-2 mb-8">
        <h1 className="text-h2 font-bold text-dark-text ">주문 상세내역</h1>
        <BackButton />
      </div>
      <OrderInfoSection info={MOCK_ORDER.info} name={MOCK_ORDER.delivery.name} />
      <OrderProductSection products={MOCK_ORDER.products} />
      <OrderPaymentSection payment={MOCK_ORDER.payment} />
      <OrderDeliverySection delivery={MOCK_ORDER.delivery} />
    </div>
  );
}

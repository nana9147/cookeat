'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BackButton from '../../components/BackButton';
import { OrderDetail } from '@/types/seller/order';
import OrderDetailHeader from '../../components/OrderDetail/OrderDetailHeader';
import OrderCustomerSection from '../../components/OrderDetail/OrderCustomerSection';
import OrderProductSection from '../../components/OrderDetail/OrderProductSection';
import OrderPaymentSection from '../../components/OrderDetail/OrderPaymentSection';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/seller/orders/${orderId}`);
        if (!cancelled) {
          setOrder(res.data.data);
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            e && typeof e === 'object' && 'response' in e
              ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
              : undefined;
          setError(message ?? '주문 정보를 불러오지 못했습니다.');
          toast.error(message ?? '주문 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="bg-background p-8">
        <div className="flex items-center gap-2 mb-8">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text">주문 상세내역</h1>
        </div>
        <div className="text-center py-16 text-gray-400 text-sm">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background p-8">
        <div className="flex items-center gap-2 mb-8">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text">주문 상세내역</h1>
        </div>
        <div className="text-center py-16 text-gray-400 text-sm">
          {error ?? '주문 정보를 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-8">
      <div className="flex items-center gap-2 mb-6">
        <BackButton />
        <h1 className="text-h2 font-bold text-dark-text">주문 상세내역</h1>
      </div>
      <OrderDetailHeader info={order.info} paymentMethod={order.payment.paymentMethod} />
      <div className="flex flex-col gap-6">
        <OrderCustomerSection customerName={order.delivery.name} delivery={order.delivery} />
        <OrderProductSection products={order.products} />
        <OrderPaymentSection payment={order.payment} />
      </div>
    </div>
  );
}

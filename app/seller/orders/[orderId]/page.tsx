'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { OrderDetail } from '@/types/seller/order';
import OrderDetailHeader from '../../components/OrderDetail/OrderDetailHeader';
import OrderCustomerSection from '../../components/OrderDetail/OrderCustomerSection';
import OrderProductSection from '../../components/OrderDetail/OrderProductSection';
import OrderPaymentSection from '../../components/OrderDetail/OrderPaymentSection';
import api from '@/lib/api';
import { toast } from 'sonner';

const CLAIM_STATUSES = ['환불요청', '환불진행중', '환불', '취소요청', '취소'];

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

  const claimProducts = order.products.filter(
    (p) => p.itemStatus !== null && CLAIM_STATUSES.includes(p.itemStatus)
  );
  const refundTotal = claimProducts.reduce((sum, p) => sum + p.itemTotalPrice, 0);
  const hasActiveClaim = claimProducts.length > 0;

  return (
    <div className="bg-background p-8">
      <div className="flex items-center gap-2 mb-6">
        <BackButton />
        <h1 className="text-h2 font-bold text-dark-text">주문 상세내역</h1>
      </div>
      <OrderDetailHeader info={order.info} paymentMethod={order.payment.paymentMethod} />
      <div className="flex flex-col gap-6">
        {hasActiveClaim && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-amber-800 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />이 주문에 처리 중인 취소·환불 요청이 있어요.
            </p>
            <Link
              href={`/seller/orders/cancel-refund/${order.info.id}`}
              className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
            >
              환불 상세내역 보기
            </Link>
          </div>
        )}
        <OrderCustomerSection customerName={order.delivery.name} delivery={order.delivery} />
        <OrderProductSection products={order.products} refundTotal={refundTotal} />
        <OrderPaymentSection payment={order.payment} />
      </div>
    </div>
  );
}

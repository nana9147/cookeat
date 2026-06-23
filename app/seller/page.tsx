import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ShoppingCart, Truck, RefreshCw } from 'lucide-react';
import type { Order } from '@/types/seller/order';
import StatusBadge from '@/app/seller/components/StatusBadge';
import type { SettlementInfo } from '@/types/seller/settlement';
import type { StateCard } from '@/types/seller/seller';

const stateCards: StateCard[] = [
  { label: '오늘 주문수', value: '127건', trend: '+12.5%', up: true, icon: ShoppingCart },
  { label: '오늘 매출', value: '2,450,000원', trend: '+8.2%', up: true, icon: TrendingUp },
  { label: '배송 대기', value: '34건', trend: '-5건', up: false, icon: Truck },
  { label: '취소/환불 요청', value: '7건', trend: '+2건', up: false, icon: RefreshCw },
];

const latestOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: '김가을',
    product: '유기농 토마토 500g',
    price: 15900,
    status: '배송준비',
    orderDate: '2024-06-09 14:16:22',
  },
  {
    id: 'ORD-2024-002',
    customer: '이여름',
    product: '무농약 상추 300g',
    price: 8500,
    status: '결제완료',
    orderDate: '2024-06-09 14:16:22',
  },
  {
    id: 'ORD-2024-003',
    customer: '박겨울',
    product: '국내산 달걀 30구',
    price: 12000,
    status: '배송중',
    orderDate: '2024-06-09 14:16:22',
  },
  {
    id: 'ORD-2024-004',
    customer: '최봄',
    product: '유기농 감자 1kg',
    price: 9800,
    status: '배송완료',
    orderDate: '2024-06-09 14:16:22',
  },
];

const settlementInfo: SettlementInfo = {
  amount: '45,280,000원',
  nextDate: '2026년 6월 5일',
};

export default function SellerPage() {
  return (
    <div className="bg-background p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-dark-text">판매 현황</h1>
        <p className="text-sm text-light-gray mt-1">오늘의 판매 데이터와 주요 지표를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stateCards.map((state) => {
          const Icon = state.icon;
          return (
            <Card key={state.label} className="border-border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-text">{state.label}</p>
                  <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
                    <Icon size={15} className="text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-dark-text">{state.value}</p>
                <p
                  className={`flex items-center gap-1 text-xs mt-2 font-medium ${state.up ? 'text-primary' : 'text-red'}`}
                >
                  {state.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  전일 대비 {state.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 최근 주문 */}
        <Card className="col-span-2 border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-h5 font-semibold text-dark-text">최근 주문</CardTitle>
              <Link
                href="/orders"
                className="text-xs text-light-gray hover:text-gray-text transition-colors"
              >
                전체보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-beige/40">
                  <th className="px-5 py-3 text-left text-xs font-medium text-light-gray">
                    주문번호
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-light-gray">
                    고객명
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-light-gray">
                    상품명
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-light-gray">금액</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-light-gray">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-border hover:bg-hover transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-light-gray hover:text-primary hover:underline transition-colors"
                      >
                        {order.id}
                      </Link>
                    </td>

                    <td className="px-3 py-3.5 text-sm text-dark-text">{order.customer}</td>
                    <td className="px-3 py-3.5 text-sm text-gray-text">{order.product}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-dark-text text-right">
                      {order.price}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 정산 정보 */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-h5 font-semibold text-dark-text">정산 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs text-light-gray mb-2">이번 달 예정 정산액</p>
              <p className="text-3xl font-bold text-dark-text leading-none">
                {settlementInfo.amount}
              </p>
              <p className="text-xs text-primary mt-2 font-medium">↑ 전월 대비 +12.3%</p>
            </div>

            <div className="h-px bg-border" />

            <div>
              <p className="text-xs text-light-gray mb-2">다음 정산일</p>
              <p className="text-lg font-semibold text-dark-text">{settlementInfo.nextDate}</p>
              <p className="text-xs text-muted mt-1">D-1</p>
            </div>

            <div className="rounded-xl bg-beige/50 p-4 border border-border">
              <p className="text-xs text-light-gray mb-1">정산 계좌</p>
              <p className="text-sm font-medium text-gray-text">국민은행 123-456-789</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

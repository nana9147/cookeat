'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';

const statCards = [
  { label: '정산 대기', value: '870만원', sub: '3건' },
  { label: '정산 완료', value: '993만원', sub: '2건' },
  { label: '수수료 총액', value: '330만원', sub: '이번 주기' },
  { label: '다음 정산일', value: '06.01', sub: 'D-3' },
];

type SettlementStatus = '정산대기' | '정산완료';

interface Order {
  id: string;
  description: string;
  amount: string;
}

interface Settlement {
  id: number;
  seller: string;
  status: SettlementStatus;
  period: string;
  revenue: string;
  commission: string;
  amount: string;
  bank: string;
  accountHolder: string;
  account: string;
  totalRevenue: string;
  refund: string;
  commissionRate: string;
  commissionAmount: string;
  tax: string;
  finalAmount: string;
  orderCount: number;
  orders: Order[];
}

const settlements: Settlement[] = [
  {
    id: 1,
    seller: '신선마켓',
    status: '정산대기',
    period: '2024.05.01 ~ 05.15',
    revenue: '542만',
    commission: '-81만',
    amount: '417만',
    bank: '국민은행',
    accountHolder: '(주)신선마켓',
    account: '123-456-789012',
    totalRevenue: '5,420,000원',
    refund: '-320,000원',
    commissionRate: '15%',
    commissionAmount: '-810,000원',
    tax: '-121,500원',
    finalAmount: '4,168,500원',
    orderCount: 234,
    orders: [
      { id: 'ORD-001', description: '신선한 양파 외 3종', amount: '28,500원' },
      { id: 'ORD-002', description: '국내산 대파 외 1종', amount: '15,800원' },
      { id: 'ORD-003', description: '유기농 당근 외 5종', amount: '45,200원' },
    ],
  },
  {
    id: 2,
    seller: '채소나라',
    status: '정산대기',
    period: '2024.05.01 ~ 05.15',
    revenue: '328만',
    commission: '-49만',
    amount: '259만',
    bank: '신한은행',
    accountHolder: '(주)채소나라',
    account: '987-654-321098',
    totalRevenue: '3,280,000원',
    refund: '-150,000원',
    commissionRate: '15%',
    commissionAmount: '-492,000원',
    tax: '-73,800원',
    finalAmount: '2,564,200원',
    orderCount: 142,
    orders: [
      { id: 'ORD-011', description: '유기농 시금치 외 2종', amount: '22,000원' },
      { id: 'ORD-012', description: '국내산 브로콜리 외 1종', amount: '18,500원' },
    ],
  },
  {
    id: 3,
    seller: '정육나라',
    status: '정산대기',
    period: '2024.05.01 ~ 05.15',
    revenue: '234만',
    commission: '-35만',
    amount: '194만',
    bank: '하나은행',
    accountHolder: '(주)정육나라',
    account: '789-012-345678',
    totalRevenue: '2,340,000원',
    refund: '-80,000원',
    commissionRate: '15%',
    commissionAmount: '-351,000원',
    tax: '-52,650원',
    finalAmount: '1,856,350원',
    orderCount: 98,
    orders: [
      { id: 'ORD-021', description: '한우 등심 1kg', amount: '85,000원' },
      { id: 'ORD-022', description: '국내산 삼겹살 외 1종', amount: '32,000원' },
    ],
  },
  {
    id: 4,
    seller: '자연농원',
    status: '정산완료',
    period: '2024.04.16 ~ 04.30',
    revenue: '612만',
    commission: '-92만',
    amount: '520만',
    bank: '우리은행',
    accountHolder: '(주)자연농원',
    account: '456-789-012345',
    totalRevenue: '6,120,000원',
    refund: '-200,000원',
    commissionRate: '15%',
    commissionAmount: '-918,000원',
    tax: '-137,700원',
    finalAmount: '4,864,300원',
    orderCount: 310,
    orders: [
      { id: 'ORD-031', description: '제철 과일 혼합세트', amount: '55,000원' },
      { id: 'ORD-032', description: '유기농 쌀 10kg', amount: '42,000원' },
    ],
  },
  {
    id: 5,
    seller: '과일천국',
    status: '정산완료',
    period: '2024.04.16 ~ 04.30',
    revenue: '381만',
    commission: '-57만',
    amount: '324만',
    bank: '기업은행',
    accountHolder: '(주)과일천국',
    account: '321-654-987012',
    totalRevenue: '3,810,000원',
    refund: '-120,000원',
    commissionRate: '15%',
    commissionAmount: '-571,500원',
    tax: '-85,725원',
    finalAmount: '3,032,775원',
    orderCount: 188,
    orders: [
      { id: 'ORD-041', description: '제주 감귤 5kg', amount: '29,000원' },
      { id: 'ORD-042', description: '국내산 딸기 외 2종', amount: '38,500원' },
    ],
  },
];


export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState<SettlementStatus>('정산대기');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedSettlement = settlements.find((s) => s.id === selectedId) ?? null;

  const filtered = settlements.filter((s) => s.status === activeTab);
  const pendingCount = settlements.filter((s) => s.status === '정산대기').length;
  const completedCount = settlements.filter((s) => s.status === '정산완료').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">정산 관리</h1>
          <p className="text-sm text-muted-foreground">판매자 정산 처리 및 내역 관리</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5">
            <CreditCard size={14} />
            일괄 정산
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('정산대기')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === '정산대기'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            정산 대기 ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('정산완료')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === '정산완료'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            정산 완료 ({completedCount})
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <Card
              onClick={() => setSelectedId(s.id)}
              key={s.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.seller}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.period}</p>
                    <div className="grid grid-cols-3 gap-4 max-w-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">매출액</p>
                        <p className="text-sm font-semibold mt-0.5">{s.revenue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">수수료</p>
                        <p className="text-sm font-semibold text-red-500 mt-0.5">{s.commission}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">정산액</p>
                        <p className="text-sm font-semibold text-primary mt-0.5">{s.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 size={13} />
                      {s.bank} {s.account}
                    </div>
                  </div>
                  {s.status === '정산대기' && (
                    <Button size="sm" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      정산 처리
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedSettlement} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSettlement?.seller} 정산 내역</DialogTitle>
          </DialogHeader>
          {selectedSettlement && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedSettlement.period}</p>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold">입금 계좌 정보</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">은행</span>
                  <span>{selectedSettlement.bank}</span>
                  <span className="text-muted-foreground">예금주</span>
                  <span>{selectedSettlement.accountHolder}</span>
                  <span className="text-muted-foreground">계좌번호</span>
                  <span>{selectedSettlement.account}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold">정산 금액 내역</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">총 매출액</span>
                    <span>{selectedSettlement.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">반품/환불</span>
                    <span className="text-red-500">{selectedSettlement.refund}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      수수료 ({selectedSettlement.commissionRate})
                    </span>
                    <span className="text-red-500">{selectedSettlement.commissionAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">부가세 (3%)</span>
                    <span className="text-red-500">{selectedSettlement.tax}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>최종 정산액</span>
                    <span className="text-primary">{selectedSettlement.finalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold">
                  포함 주문 ({selectedSettlement.orderCount}건 중 일부)
                </p>
                <div className="space-y-2">
                  {selectedSettlement.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-muted-foreground text-xs">{order.description}</p>
                      </div>
                      <span>{order.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSettlement.status === '정산대기' && (
                <Button className="w-full" onClick={() => setSelectedId(null)}>
                  정산 처리하기 → {selectedSettlement.finalAmount} 이체
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

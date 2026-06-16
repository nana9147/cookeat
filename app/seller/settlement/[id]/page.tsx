'use client';

import { SettlementDetail } from '@/types/seller/settlement';
import BackButton from '../../components/BackButton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import SettlementBasicInfo from '../../components/SettlementDetail/SettlementBasicInfo';
import SettlementAmountDetail from '../../components/SettlementDetail/SettlementAmountDetail';
import SettlementBankInfo from '../../components/SettlementDetail/SettlementBankInfo';
import SettlementOrderTable from '../../components/SettlementDetail/SettlementOrderTable';

const MOCK_SETTLEMENT_DETAIL: SettlementDetail = {
  id: 'SET-001',
  period: '2026년 6월 3주차',
  periodRange: '06.09 - 06.15',
  settlementDate: '2026-06-16',
  status: '정산예정',
  paymentMethod: '계좌 이체',
  amountDetail: {
    totalSalesAmount: 4850000,
    commissionRate: 10,
    commission: 485000,
    shippingFee: 42000,
    vatRate: 10,
    vat: 44720,
    refundAmount: 85000,
    finalAmount: 4193280,
  },
  bankInfo: {
    bankName: '국민은행',
    accountNumber: '123-456-7890123',
    accountHolder: '쿡잇컴퍼니',
  },
  orders: [
    {
      orderId: 'ORD-2026-001234',
      productName: '청양고추 500g 외 2건',
      orderDate: '2026-06-09',
      salesAmount: 85000,
      commission: 8500,
      shippingFee: 3000,
      settlementAmount: 73500,
      status: '배송완료',
    },
    {
      orderId: 'ORD-2026-001235',
      productName: '유기농 토마토 1kg',
      orderDate: '2026-06-10',
      salesAmount: 45000,
      commission: 4500,
      shippingFee: 2500,
      settlementAmount: 38000,
      status: '배송완료',
    },
    {
      orderId: 'ORD-2026-001236',
      productName: '생크림 200ml 외 1건',
      orderDate: '2026-06-11',
      salesAmount: 38000,
      commission: 3800,
      shippingFee: 2000,
      settlementAmount: 0,
      status: '취소',
    },
  ],
};

export default function SettlementDetailPage() {
  return (
    <div className="bg-background p-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text leading-none">정산 상세</h1>
        </div>
        <Button className="p-5" size="lg" onClick={() => console.log('다운로드중..')}>
          <Download size={14} />
          PDF 다운로드
        </Button>
      </div>

      <SettlementBasicInfo detail={MOCK_SETTLEMENT_DETAIL} />
      <SettlementAmountDetail detail={MOCK_SETTLEMENT_DETAIL} />
      <SettlementBankInfo detail={MOCK_SETTLEMENT_DETAIL} />
      <SettlementOrderTable orders={MOCK_SETTLEMENT_DETAIL.orders} />
    </div>
  );
}

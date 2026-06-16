import { OrderStatus } from './order';

export interface SettlementInfo {
  amount: string;
  nextDate: string;
}

export type SettlementStatus = '정산완료' | '정산예정' | '정산보류';
export interface Settlement {
  id: string;
  period: string;
  totalSalesAmount: number;
  commission: number;
  shippingFee: number;
  settlementAmount: number;
  settlementDate: string;
  status: SettlementStatus;
}

export interface SettlementNext {
  nextSettlementAmount: number;
  totalSalesAmount: number;
  commission: number;
  commissionRate: number;
  shippingFee: number;
  nextSettlementDate: string;
}

export interface SettlementHeroCardProps {
  nextSettlement: SettlementNext;
}

export interface SettlementSummaryCardsProps {
  settlementAmount: number;
  settlementCount: number;
  commissionRate: number;
  shippingFee: number;
}

export interface SettlementSearchFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearch: () => void;
}

export interface SettlementTableProps {
  data: Settlement[];
}

// 주문별 정산 내역
export interface SettlementOrderItem {
  orderId: string;
  productName: string;
  orderDate: string;
  salesAmount: number;
  commission: number;
  shippingFee: number;
  settlementAmount: number;
  status: OrderStatus;
}

// 입금 정보
export interface SettlementBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// 정산 금액 상세
export interface SettlementAmountDetail {
  totalSalesAmount: number;
  commissionRate: number;
  commission: number;
  shippingFee: number;
  vatRate: number;
  vat: number;
  refundAmount: number;
  finalAmount: number;
}

// 정산 상세 전체
export interface SettlementDetail {
  id: string;
  period: string;
  periodRange: string;
  settlementDate: string;
  status: SettlementStatus;
  paymentMethod: string;
  amountDetail: SettlementAmountDetail;
  bankInfo: SettlementBankInfo;
  orders: SettlementOrderItem[];
}

export interface SettlementDetailProps {
  detail: SettlementDetail;
}

export interface SettlementOrderTableProps {
  orders: SettlementOrderItem[];
}

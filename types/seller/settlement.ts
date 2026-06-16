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
  onSearch: () => void; //
}

export interface SettlementTableProps {
  data: Settlement[];
}

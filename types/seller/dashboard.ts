export interface DashboardStatCard {
  label: string;
  count: number;
  diff: number | null; // null이면 화면에 "전일 대비" 표시 안 함 (정확한 이력 데이터 없는 항목)
}

export interface DashboardStats {
  totalOrders: DashboardStatCard;
  newOrders: DashboardStatCard;
  preparingShipment: DashboardStatCard;
  shipping: DashboardStatCard;
  delivered: DashboardStatCard;
  cancelledOrRefunded: DashboardStatCard;
}

export interface DashboardOrderTrendPoint {
  date: string; // 'YYYY-MM-DD'
  count: number;
  amount: number;
}

export interface DashboardReviewSummary {
  totalCount: number;
  averageRating: number;
  pendingReplyCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  orderTrend: DashboardOrderTrendPoint[];
  settlement: {
    scheduledTotal: number;
    pendingTotal: number;
    nextSettlementDate: string | null;
  };
  review: DashboardReviewSummary;
}

export interface DashboardStatCardsProps {
  stats: DashboardStats;
}

export interface DashboardOrderTrendChartProps {
  data: DashboardOrderTrendPoint[];
}

export interface DashboardSettlementCardProps {
  settlement: DashboardData['settlement'];
}

export interface DashboardReviewSummaryCardProps {
  review: DashboardReviewSummary;
}

export interface StatisticsSummary {
  totalRevenue: number;
  totalQuantity: number;
  averageOrderValue: number;
  soldProductCount: number;
}

export interface ProductRankingItem {
  productId: number;
  name: string;
  image: string | null;
  revenue: number;
  quantity: number;
}

export interface CategoryBreakdownItem {
  categoryName: string;
  revenue: number;
  ratio: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface ClaimRateStat {
  totalCount: number;
  claimCount: number;
  claimRate: number;
  buyerFaultCount: number;
  sellerFaultCount: number;
}

export interface CustomerStat {
  newCustomerCount: number;
  returningCustomerCount: number;
  returningRate: number;
}

export interface StatisticsData {
  summary: StatisticsSummary;
  productRanking: ProductRankingItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  revenueTrend: RevenueTrendPoint[];
  claimRate: ClaimRateStat;
  customer: CustomerStat;
}

export interface StatisticsSummaryCardsProps {
  summary: StatisticsSummary;
}

export interface ProductRankingCardProps {
  items: ProductRankingItem[];
}

export interface CategoryBreakdownChartProps {
  items: CategoryBreakdownItem[];
}

export interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export interface ClaimRateCardProps {
  claimRate: ClaimRateStat;
}

export interface CustomerCardProps {
  customer: CustomerStat;
}

import { Card, CardContent } from '@/components/ui/card';
import type { StatisticsSummaryCardsProps } from '@/types/seller/statistics';

export default function StatisticsSummaryCards({ summary }: StatisticsSummaryCardsProps) {
  const cards = [
    { label: '총 매출', value: `${summary.totalRevenue.toLocaleString()}원` },
    { label: '총 판매수량', value: `${summary.totalQuantity.toLocaleString()}개` },
    { label: '평균 주문금액', value: `${summary.averageOrderValue.toLocaleString()}원` },
    { label: '판매된 상품 종류', value: `${summary.soldProductCount}종` },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-light-gray">{c.label}</p>
            <p className="text-h4 font-bold text-dark-text mt-1">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

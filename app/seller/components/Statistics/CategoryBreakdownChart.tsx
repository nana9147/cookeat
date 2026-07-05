'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { CategoryBreakdownChartProps } from '@/types/seller/statistics';

const COLORS = ['var(--color-primary)', '#F5A623', '#7ED6A5', '#5B9BD5', '#D97C7C', '#B08BE0'];

export default function CategoryBreakdownChart({ items }: CategoryBreakdownChartProps) {
  const chartConfig = Object.fromEntries(
    items.map((item, idx) => [
      item.categoryName,
      { label: item.categoryName, color: COLORS[idx % COLORS.length] },
    ])
  );

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">카테고리별 매출 비중</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <p className="text-sm text-light-gray text-center py-10">판매 데이터가 없습니다.</p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-52 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={items}
                  dataKey="revenue"
                  nameKey="categoryName"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {items.map((item, idx) => (
                    <Cell key={item.categoryName} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-1.5 mt-4">
              {items.map((item, idx) => (
                <div key={item.categoryName} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-text">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    {item.categoryName}
                  </span>
                  <span className="text-dark-text">{item.ratio}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

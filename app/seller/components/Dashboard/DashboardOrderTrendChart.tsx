'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DashboardOrderTrendChartProps } from '@/types/seller/dashboard';

const chartConfig = {
  count: {
    label: '주문',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig;

function formatDateLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type Period = 7 | 30;

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 7, label: '7일' },
  { value: 30, label: '30일' },
];

export default function DashboardOrderTrendChart({ data }: DashboardOrderTrendChartProps) {
  const [period, setPeriod] = useState<Period>(7);

  const visibleData = useMemo(() => data.slice(-period), [data, period]);

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between max-mobile:flex-col max-mobile:items-start max-mobile:gap-2">
          <CardTitle className="text-h5 font-semibold text-dark-text">
            주문 현황 (최근 {period}일)
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-beige/50 p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-light-gray hover:text-gray-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-72 w-full max-mobile:h-56">
          <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="orderTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDateLabel}
              interval={period === 30 ? 4 : 0}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--color-count)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  labelKey="date"
                  indicator="dot"
                  labelFormatter={(_, payload) =>
                    formatDateLabel(payload?.[0]?.payload?.date ?? '')
                  }
                />
              }
            />
            <Area
              dataKey="count"
              type="monotone"
              stroke="var(--color-count)"
              strokeWidth={2.5}
              fill="url(#orderTrendFill)"
              dot={
                period === 30
                  ? false
                  : {
                      r: 4,
                      fill: 'var(--color-count)',
                      strokeWidth: 2,
                      stroke: 'var(--color-background)',
                    }
              }
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--color-background)' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    label: '주문건수',
    color: 'var(--color-primary)',
  },
  amount: {
    label: '판매금액',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

function formatDateLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type Period = 7 | 30;
type Metric = 'count' | 'amount';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 7, label: '최근 7일' },
  { value: 30, label: '최근 30일' },
];

const METRIC_UNIT: Record<Metric, string> = {
  count: '건',
  amount: '원',
};

export default function DashboardOrderTrendChart({ data }: DashboardOrderTrendChartProps) {
  const [period, setPeriod] = useState<Period>(7);
  const [metric, setMetric] = useState<Metric>('count');

  const visibleData = useMemo(() => data.slice(-period), [data, period]);
  const metricColor = `var(--color-${metric})`;

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="gap-3 border-b border-border pb-3">
        <div className="flex items-center justify-between gap-3 max-mobile:flex-col max-mobile:items-stretch">
          <CardTitle className="text-h5 font-semibold text-dark-text">주문 현황</CardTitle>
          <Select
            value={String(period)}
            onValueChange={(v) => setPeriod(Number(v) as Period)}
          >
            <SelectTrigger size="sm" className="w-26 max-mobile:w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList variant="line" className="h-8 gap-4">
            <TabsTrigger
              value="count"
              className="px-0 pb-2 after:h-0.75 after:bg-primary data-active:text-primary"
            >
              주문건수
            </TabsTrigger>
            <TabsTrigger
              value="amount"
              className="px-0 pb-2 after:h-0.75 after:bg-chart-2 data-active:text-chart-2"
            >
              판매금액
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-72 w-full max-mobile:h-56">
          <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="orderTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={metricColor} stopOpacity={0.03} />
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
              cursor={{ stroke: metricColor, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  labelKey="date"
                  indicator="dot"
                  labelFormatter={(_, payload) =>
                    formatDateLabel(payload?.[0]?.payload?.date ?? '')
                  }
                  formatter={(value) =>
                    `${Number(value).toLocaleString()}${METRIC_UNIT[metric]}`
                  }
                />
              }
            />
            <Area
              dataKey={metric}
              type="monotone"
              stroke={metricColor}
              strokeWidth={2.5}
              fill="url(#orderTrendFill)"
              dot={
                period === 30
                  ? false
                  : {
                      r: 4,
                      fill: metricColor,
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

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StatCard {
  label: string;
  value: string;
  trend: string;
  up: boolean;
}
interface SellerRevenue {
  rank: number;
  name: string;
  sub: string;
  price: string;
}
interface CategoryStat {
  name: string;
  percent: number;
  revenue: string;
}

function formatKoreanAmount(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(1)}억원`;
  if (won >= 10_000) return `${Math.round(won / 10_000)}만원`;
  return `${won.toLocaleString()}원`;
}

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만명`;
  return `${n.toLocaleString()}명`;
}

function formatTrend(trend: number): string {
  return trend >= 0 ? `+${trend}%` : `${trend}%`;
}

export default function AdminPage() {
  const [statCards, setStatCards] = useState<StatCard[]>([]);
  const [sellerTopRevenue, setSellerTopRevenue] = useState<SellerRevenue[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/analytics');
        const s = data.statCards;
        setStatCards([
          {
            label: 'GMV (총 거래액)',
            value: formatKoreanAmount(s.gmv),
            trend: formatTrend(s.gmvTrend),
            up: s.gmvTrend >= 0,
          },
          {
            label: '전환율',
            value: `${s.conversionRate}%`,
            trend: formatTrend(s.conversionRateTrend),
            up: s.conversionRateTrend >= 0,
          },
          { label: '재구매율', value: `${s.repurchaseRate}%`, trend: '', up: true },
          {
            label: 'MAU',
            value: formatCount(s.mau),
            trend: formatTrend(s.mauTrend),
            up: s.mauTrend >= 0,
          },
        ]);
        setSellerTopRevenue(data.sellerTopRevenue);
        setCategoryStats(data.categoryStats);
      } catch (e) {
        setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">불러오는 중...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">통계/분석</h1>
        <p className="text-sm text-muted-foreground">운영 성과를 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-2  md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p
                className={`flex items-center gap-1 text-sm mt-1 ${stat.up ? 'text-primary' : 'text-red'}`}
              >
                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별 매출</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.name}</span>
                  <span>{cat.revenue}</span>
                </div>
                <Progress value={cat.percent} className="h-2" />
                <p className="text-xs text-muted-foreground">{cat.percent}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base mb-4">판매자별 매출 TOP 5</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sellerTopRevenue.map((item) => (
              <div key={item.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-base font-bold text-muted-foreground w-7 ">
                    #{item.rank}
                  </span>
                  <p className="text-base font-semibold">{item.name}</p>
                </div>
                <span className="text-base font-bold">{item.price}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

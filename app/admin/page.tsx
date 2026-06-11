'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/api';

interface StatCard {
  label: string;
  value: string;
  trend: string;
  up: boolean;
}

interface PopularProduct {
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

export default function AdminPage() {
  const [statCards, setStatCards] = useState<StatCard[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      const s = data.statCards;

      setStatCards([
        { label: '오늘 총 매출', value: `${s.todayRevenue.toLocaleString()}원`, trend: '', up: true },
        { label: '주문 건수', value: `${s.orderCount}건`, trend: '', up: true },
        { label: '신규 가입자', value: `${s.newMembers}명`, trend: '', up: true },
        { label: '판매자 가입', value: `${s.newSellers}명`, trend: '', up: true },
        { label: '취소/환불', value: `${s.cancelCount}건`, trend: '', up: false },
        { label: '문의 건수', value: `${s.inquiryCount}건`, trend: '', up: true },
      ]);
      setPopularProducts(data.popularProducts);
      setCategoryStats(data.categoryStats);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">실시간 운영 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
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
            <CardTitle className="text-base">인기 상품</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {popularProducts.map((item) => (
              <div key={item.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground w-6">
                    #{item.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{item.price}</span>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}

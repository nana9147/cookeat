import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

const statCards = [
  { label: 'GMV (총 거래액)', value: '3.2억원', trend: '+18.5%', up: true },
  { label: '전환율', value: '3.8%', trend: '+0.5%', up: true },
  { label: '재구매율', value: '42.3%', trend: '+2.1%', up: true },
  { label: 'MAU', value: '4.5만명', trend: '+12.3%', up: true },
];

const popularProducts = [
  { rank: 1, name: '신선마켓', sub: '', price: '5420만원' },
  { rank: 2, name: '자연농원', sub: '', price: '4830만원' },
  { rank: 3, name: '정육점', sub: '', price: '4210만원' },
  { rank: 4, name: '채소나라', sub: '', price: '3580만원' },
  { rank: 5, name: '해산물마트', sub: '', price: '2890만원' },
];

const categoryStats = [
  { name: '채소', percent: 30, revenue: '9500만원' },
  { name: '육류', percent: 25, revenue: '8000만원' },
  { name: '과일', percent: 22, revenue: '7000만원' },
  { name: '수산', percent: 16, revenue: '5000만원' },
  { name: '기타', percent: 8, revenue: '2500만원' },
];

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">실시간 운영 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-2  md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p
                className={`flex items-center gap-1 text-sm mt-1 ${stat.up ? 'text-green-600' : 'text-red-500'}`}
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
            {popularProducts.map((item) => (
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

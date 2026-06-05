import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

const statCards = [
  { label: '오늘 총 매출', value: '12,450,000원', trend: '+15.3%', up: true },
  { label: '주문 건수', value: '342건', trend: '+8.2%', up: true },
  { label: '신규 가입자', value: '28명', trend: '+12.5%', up: true },
  { label: '판매자 가입', value: '5명', trend: '+2명', up: true },
  { label: '취소/환불', value: '12건', trend: '-3.1%', up: false },
  { label: '문의 건수', value: '47건', trend: '+5건', up: true },
];

const popularProducts = [
  { rank: 1, name: '신선한 양파', sub: '234건 판매', price: '1,250,000원' },
  { rank: 2, name: '국내산 대파', sub: '189건 판매', price: '980,000원' },
  { rank: 3, name: '프리미엄 소고기', sub: '87건 판매', price: '2,340,000원' },
  { rank: 4, name: '유기농 당근', sub: '156건 판매', price: '780,000원' },
];

const categoryStats = [
  { name: '채소', percent: 35, revenue: '4,500,000원' },
  { name: '육류', percent: 25, revenue: '3,200,000원' },
  { name: '과일', percent: 22, revenue: '2,800,000원' },
  { name: '수산', percent: 18, revenue: '2,300,000원' },
];

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">실시간 운영 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

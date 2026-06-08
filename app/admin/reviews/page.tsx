'use client';

import { AlertCircle, MessageCircle, CheckCircle2, Eye, Trash2, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < count ? 'fill-yellow text-yellow' : 'fill-muted text-muted'}
        />
      ))}
    </div>
  );
}

const statCards = [
  { label: '신고 대기', value: '12건', icon: AlertCircle, iconColor: 'text-red', valueColor: 'text-red' },
  { label: '악성 리뷰', value: '8건', icon: MessageCircle, iconColor: 'text-yellow', valueColor: 'text-yellow' },
  { label: '처리 완료', value: '156건', icon: CheckCircle2, iconColor: 'text-primary', valueColor: 'text-primary' },
];

interface Review {
  id: number;
  productName: string;
  author: string;
  rating: number;
  date: string;
  reportCount: number;
  state: '정상' | '신고' | '처리완료';
}

const reviews: Review[] = [
  { id: 1, productName: '신선한 양파', author: '김쿡잇', rating: 5, date: '2024.05.28', reportCount: 0, state: '정상' },
  { id: 2, productName: '국내산 대파', author: '이레시피', rating: 4, date: '2024.05.27', reportCount: 0, state: '정상' },
  { id: 3, productName: '프리미엄 소고기', author: '박요리', rating: 1, date: '2024.05.26', reportCount: 3, state: '신고' },
];

const stateBadge: Record<Review['state'], string> = {
  정상: 'bg-primary text-white',
  신고: 'bg-red text-white',
  처리완료: 'bg-muted text-muted-foreground',
};

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">리뷰/신고 관리</h1>
        <p className="text-sm text-muted-foreground">전체 리뷰: 3,456개 (신고: 12개)</p>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconColor, valueColor }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <Icon size={18} className={iconColor} />
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
              <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>평점</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead>신고수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.productName}</TableCell>
                <TableCell className="text-muted-foreground">{r.author}</TableCell>
                <TableCell>
                  <StarRating count={r.rating} />
                </TableCell>
                <TableCell className="text-muted-foreground">{r.date}</TableCell>
                <TableCell className="text-red font-medium">{r.reportCount}건</TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${stateBadge[r.state]}`}>
                    {r.state}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-text hover:text-primary" aria-label="상세보기">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-text hover:text-red" aria-label="삭제">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

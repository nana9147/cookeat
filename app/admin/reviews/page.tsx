'use client';

import { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={14} className="fill-yellow text-yellow" />
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

const statCards = [
  {
    label: '신고 대기',
    value: '12건',
    icon: AlertCircle,
    iconColor: 'text-red',
    valueColor: 'text-red',
  },
  {
    label: '악성 리뷰',
    value: '8건',
    icon: MessageCircle,
    iconColor: 'text-yellow',
    valueColor: 'text-yellow',
  },
  {
    label: '처리 완료',
    value: '156건',
    icon: CheckCircle2,
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
];

interface Report {
  reporter: string;
  date: string;
  reason: string;
}

interface Review {
  id: number;
  productName: string;
  author: string;
  email: string;
  rating: number;
  date: string;
  reportCount: number;
  state: '정상' | '신고' | '처리완료';
  content: string;
  reports: Report[];
}

const initialReviews: Review[] = [
  {
    id: 1,
    productName: '신선한 양파',
    author: '김쿡잇',
    email: 'user1@example.com',
    rating: 5,
    date: '2024.05.28 09:30',
    reportCount: 0,
    state: '정상',
    content: '정말 신선하고 맛있는 양파였어요. 빠른 배송도 만족스러웠습니다.',
    reports: [],
  },
  {
    id: 2,
    productName: '국내산 대파',
    author: '이레시피',
    email: 'user2@example.com',
    rating: 4,
    date: '2024.05.27 14:20',
    reportCount: 0,
    state: '정상',
    content: '대파 상태가 좋았습니다. 다음에도 구매할 예정입니다.',
    reports: [],
  },
  {
    id: 3,
    productName: '프리미엄 소고기',
    author: '박요리',
    email: 'user3@example.com',
    rating: 1,
    date: '2024.05.26 10:15',
    reportCount: 3,
    state: '신고',
    content: '상품 상태가 좋지 않았습니다. 냄새도 이상하고 포장도 엉망이었어요.',
    reports: [
      { reporter: '김쿡잇', date: '2024.05.27', reason: '허위 리뷰' },
      { reporter: '이레시피', date: '2024.05.27', reason: '악의적인 내용' },
      { reporter: '최맛있', date: '2024.05.28', reason: '부적절한 표현' },
    ],
  },
];


export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = reviews.find((r) => r.id === selectedId) ?? null;

  function handleBlind(id: number) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, state: '처리완료' as const } : r)));
    setSelectedId(null);
  }

  function handleDelete(id: number) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">리뷰/신고 관리</h1>
        <p className="text-sm text-muted-foreground">전체 리뷰: 3,456개 (신고: 12개)</p>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
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
                  <StarRating rating={r.rating} />
                </TableCell>
                <TableCell className="text-muted-foreground">{r.date}</TableCell>
                <TableCell className="text-red font-medium">{r.reportCount}건</TableCell>
                <TableCell>
                  <StatusBadge status={r.state} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-primary"
                      aria-label="상세보기"
                      onClick={() => setSelectedId(r.id)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-red"
                      aria-label="삭제"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>리뷰 상세 정보</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">리뷰 ID: {selected.id}</p>

              {selected.reportCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-red/10 border border-red/20 p-3">
                  <AlertCircle size={16} className="text-red mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red">신고된 리뷰입니다</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      총 {selected.reportCount}건의 신고가 접수되었습니다. 내용을 확인하고 적절한
                      조치를 취해주세요.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-3">
                <p className="font-semibold">리뷰 정보</p>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">상품명</p>
                    <p className="font-medium">{selected.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성자</p>
                    <p>{selected.author}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">이메일</p>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성일</p>
                    <p>{selected.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">평점</p>
                    <StarRating rating={selected.rating} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">상태</p>
                    <StatusBadge status={selected.state} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold">리뷰 내용</p>
                <p className="text-muted-foreground leading-relaxed">{selected.content}</p>
              </div>

              {selected.reports.length > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="font-semibold">신고 내역 ({selected.reports.length}건)</p>
                  <div className="space-y-2">
                    {selected.reports.map((rep, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rep.reporter}</span>
                          <span className="text-muted-foreground text-xs">{rep.date}</span>
                        </div>
                        <span className="text-xs bg-beige px-2 py-0.5 rounded">{rep.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedId(null)}
                >
                  목록
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBlind(selected.id)}
                >
                  블라인드 처리
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red text-white"
                  onClick={() => handleDelete(selected.id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

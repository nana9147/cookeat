'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type InquiryState = '답변대기' | '처리중' | '답변완료';
type InquiryCategory = '배송' | '환불' | '상품' | '기타';

interface Inquiry {
  id: number;
  title: string;
  author: string;
  category: InquiryCategory;
  date: string;
  state: InquiryState;
}

const categoryBadge: Record<InquiryCategory, string> = {
  배송: 'bg-blue-100 text-blue-700',
  환불: 'bg-red-100 text-red',
  상품: 'bg-green-100 text-green-700',
  기타: 'bg-gray-100 text-gray-700',
};

const stateBadge: Record<InquiryState, string> = {
  답변대기: 'bg-yellow text-white',
  처리중: 'bg-primary text-white',
  답변완료: 'bg-beige text-foreground',
};

const inquiries: Inquiry[] = [
  {
    id: 1,
    title: '배송 관련 문의',
    author: '김쿡잇',
    category: '배송',
    date: '05.29',
    state: '답변대기',
  },
  {
    id: 2,
    title: '환불 요청',
    author: '이레시피',
    category: '환불',
    date: '05.28',
    state: '처리중',
  },
  {
    id: 3,
    title: '상품 문의',
    author: '박요리',
    category: '상품',
    date: '05.27',
    state: '답변완료',
  },
];

export default function SupportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">고객센터 관리</h1>
          <p className="text-sm text-muted-foreground">미처리: 47건</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/support/inquiry"
            className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            1:1 문의
          </Link>
          <Link
            href="/admin/support/faq"
            className="px-5 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-beige transition-colors"
          >
            FAQ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 대기</p>
            <p className="text-3xl font-bold text-yellow mt-1">23건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">처리 중</p>
            <p className="text-3xl font-bold text-primary mt-1">24건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 완료</p>
            <p className="text-3xl font-bold mt-1">1,234건</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>문의자</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inq) => (
              <TableRow key={inq.id}>
                <TableCell className="font-medium">{inq.title}</TableCell>
                <TableCell className="text-muted-foreground">{inq.author}</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${categoryBadge[inq.category]}`}
                  >
                    {inq.category}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{inq.date}</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${stateBadge[inq.state]}`}
                  >
                    {inq.state}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" className="h-7 px-3 text-xs">
                    답변
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

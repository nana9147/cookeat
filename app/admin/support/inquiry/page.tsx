'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Eye, User, Store } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type InquiryState = '답변대기' | '처리중' | '답변완료';
type TargetType = '관리자' | '신선마켓';

interface Inquiry {
  id: number;
  title: string;
  customer: string;
  target: TargetType;
  date: string;
  state: InquiryState;
  unread?: number;
}

const stateBadge: Record<InquiryState, string> = {
  답변대기: 'bg-yellow text-white',
  처리중: 'bg-primary text-white',
  답변완료: 'bg-beige text-foreground',
};

const initialInquiries: Inquiry[] = [
  {
    id: 1,
    title: '배송 관련 문의',
    customer: '김쿡잇',
    target: '관리자',
    date: '2024.05.29',
    state: '답변대기',
    unread: 1,
  },
  {
    id: 2,
    title: '상품 문의',
    customer: '이레시피',
    target: '신선마켓',
    date: '2024.05.28',
    state: '답변완료',
  },
  {
    id: 3,
    title: '환불 요청',
    customer: '박요리',
    target: '관리자',
    date: '2024.05.27',
    state: '처리중',
  },
];

export default function InquiryPage() {
  const [search, setSearch] = useState('');

  const filtered = initialInquiries.filter(
    (i) => i.title.includes(search) || i.customer.includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/support"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">1:1 문의 관리</h1>
          <p className="text-sm text-muted-foreground">전체: {initialInquiries.length}개</p>
        </div>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 대기</p>
            <p className="text-3xl font-bold text-yellow mt-1">12건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">처리 중</p>
            <p className="text-3xl font-bold text-primary mt-1">8건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 완료</p>
            <p className="text-3xl font-bold mt-1">234건</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9 bg-white"
          placeholder="문의 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>대상</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inq) => (
              <TableRow key={inq.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {inq.title}
                    {inq.unread && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow text-white text-xs font-bold">
                        {inq.unread}
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{inq.customer}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-muted-foreground text-sm">
                    {inq.target === '관리자' ? <User size={14} /> : <Store size={14} />}
                    {inq.target}
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
                  <button className="text-primary" aria-label="상세보기">
                    <Eye size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

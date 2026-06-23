'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';

interface InquiryItem {
  inquiryId: number;
  title: string;
  author: string;
  category: string;
  isAnswered: boolean;
  createdAt: string;
}

interface Stats {
  waiting: number;
  answered: number;
}

export default function SupportPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ waiting: 0, answered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/inquiries', { params: { limit: 10 } });
        setInquiries(data.inquiries ?? []);

        const [waitingRes, answeredRes] = await Promise.all([
          api.get('/admin/inquiries', { params: { answered: 'false', limit: 1 } }),
          api.get('/admin/inquiries', { params: { answered: 'true', limit: 1 } }),
        ]);
        setStats({
          waiting: waitingRes.data.pagination?.total ?? 0,
          answered: answeredRes.data.pagination?.total ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">고객센터 관리</h1>
          <p className="text-sm text-muted-foreground">미처리: {stats.waiting}건</p>
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

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 대기</p>
            <p className="text-3xl font-bold text-yellow mt-1">{stats.waiting}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 완료</p>
            <p className="text-3xl font-bold mt-1">{stats.answered.toLocaleString()}건</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="hidden md:table-cell">문의자</TableHead>
              <TableHead className="hidden md:table-cell">카테고리</TableHead>
              <TableHead className="hidden md:table-cell">날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  문의가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow key={inq.inquiryId}>
                  <TableCell className="font-medium">{inq.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{inq.author}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {inq.category}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(inq.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inq.isAnswered ? '답변완료' : '답변대기'} />
                  </TableCell>
                  <TableCell>
                    <Link href="/admin/support/inquiry">
                      <Button size="sm" className="h-7 px-3 text-xs">
                        답변
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

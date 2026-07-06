'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Eye, Send } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Pagination from '@/components/ui/Pagination';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import { getPageNumbers } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 20;

type Category = '전체' | '레시피' | '쿠폰' | '계정';
const CATEGORIES: Category[] = ['전체', '레시피', '쿠폰', '계정'];

interface Reply {
  content: string;
  createdAt: string;
}

interface InquiryItem {
  inquiryId: number;
  title: string;
  author: string;
  category: string;
  content: string;
  isAnswered: boolean;
  reply: Reply | null;
  createdAt: string;
}

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ waiting: 0, answered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<Category>('전체');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  const prevCategoryRef = useRef(category);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  const fetchInquiries = async () => {
    try {
      const categoryParam = category === '전체' ? undefined : category;
      const [{ data }, waitingRes, answeredRes] = await Promise.all([
        api.get('/admin/faqs', {
          params: {
            keyword: debouncedSearch || undefined,
            category: categoryParam,
            page,
            limit: PAGE_SIZE,
          },
        }),
        api.get('/admin/faqs', {
          params: { category: categoryParam, answered: 'false', limit: 1 },
        }),
        api.get('/admin/faqs', { params: { category: categoryParam, answered: 'true', limit: 1 } }),
      ]);
      if (!cancelledRef.current) {
        setInquiries(data.inquiries ?? []);
        setTotal(data.pagination?.total ?? 0);
        setStats({
          waiting: waitingRes.data.pagination?.total ?? 0,
          answered: answeredRes.data.pagination?.total ?? 0,
        });
        setError(false);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        console.error(err);
        setError(true);
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    const isNewSearch =
      prevSearchRef.current !== debouncedSearch || prevCategoryRef.current !== category;
    prevSearchRef.current = debouncedSearch;
    prevCategoryRef.current = category;

    if (isNewSearch && page !== 1) {
      setPage(1);
    } else {
      setLoading(true);
      fetchInquiries();
    }
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const selectedInquiry = inquiries.find((i) => i.inquiryId === selectedId) ?? null;

  function openChat(id: number) {
    setSelectedId(id);
    setInputText('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function sendReply() {
    const text = inputText.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    try {
      await api.post(`/admin/faqs/${selectedId}/reply`, { content: text });
      setInputText('');
      await fetchInquiries();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e: unknown) {
      const msg =
        (e as { data?: { error?: string }; message?: string })?.data?.error ??
        (e as { message?: string })?.message ??
        '답변 전송 실패';
      alert(msg);
    } finally {
      setSending(false);
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

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
          <h1 className="text-2xl font-bold">고객 문의 관리</h1>
          <p className="text-sm text-muted-foreground">레시피·쿠폰·계정 문의 · 전체: {total}개</p>
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
            <p className="text-3xl font-bold mt-1">{stats.answered}건</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap p-4 bg-white rounded-md border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-beige text-foreground hover:bg-primary/10'
            }`}
          >
            {cat}
          </button>
        ))}
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
              <TableHead className="hidden md:table-cell">고객</TableHead>
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
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive py-8">
                  데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
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
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {inq.author}
                  </TableCell>
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
                    <button
                      className="text-primary hover:text-primary/70 transition-colors"
                      aria-label="문의 열기"
                      onClick={() => openChat(inq.inquiryId)}
                    >
                      <Eye size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />

      <Sheet open={!!selectedInquiry} onOpenChange={() => setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:w-105 flex flex-col p-0">
          {selectedInquiry && (
            <>
              <SheetHeader className="px-5 pt-5 pb-3 border-b space-y-2">
                <SheetTitle className="text-base font-semibold">{selectedInquiry.title}</SheetTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedInquiry.author}</span>
                    <span>·</span>
                    <span>{formatDate(selectedInquiry.createdAt)}</span>
                  </div>
                  <StatusBadge status={selectedInquiry.isAnswered ? '답변완료' : '답변대기'} />
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-xs text-muted-foreground">{selectedInquiry.author}</span>
                  <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-2 text-sm leading-relaxed bg-beige text-foreground">
                    {selectedInquiry.content}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(selectedInquiry.createdAt)}
                  </span>
                </div>

                {selectedInquiry.reply && (
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-muted-foreground">관리자</span>
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2 text-sm leading-relaxed bg-primary text-white">
                      {selectedInquiry.reply.content}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(selectedInquiry.reply.createdAt)}
                    </span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t px-4 py-3 flex gap-2 items-end bg-white">
                <Input
                  className="flex-1 resize-none"
                  placeholder={
                    selectedInquiry.isAnswered ? '이미 답변된 문의입니다' : '답변을 입력하세요...'
                  }
                  value={inputText}
                  disabled={selectedInquiry.isAnswered || sending}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  disabled={!inputText.trim() || selectedInquiry.isAnswered || sending}
                  onClick={sendReply}
                >
                  <Send size={16} />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

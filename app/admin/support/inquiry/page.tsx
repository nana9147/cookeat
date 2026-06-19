'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Eye, User, Store, Send } from 'lucide-react';
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

type InquiryState = '답변대기' | '처리중' | '답변완료';
type TargetType = '관리자' | '신선마켓';

interface Message {
  id: number;
  sender: 'admin' | 'user';
  text: string;
  time: string;
}

interface Inquiry {
  id: number;
  title: string;
  customer: string;
  target: TargetType;
  date: string;
  state: InquiryState;
  unread?: number;
  messages: Message[];
}


const initialInquiries: Inquiry[] = [
  {
    id: 1,
    title: '배송 관련 문의',
    customer: '김쿡잇',
    target: '관리자',
    date: '2024.05.29',
    state: '답변대기',
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'user',
        text: '주문한 상품이 아직 배송이 안 됐어요. 언제 도착하나요?',
        time: '14:22',
      },
    ],
  },
  {
    id: 2,
    title: '상품 문의',
    customer: '이레시피',
    target: '신선마켓',
    date: '2024.05.28',
    state: '답변완료',
    messages: [
      { id: 1, sender: 'user', text: '이 상품 유통기한이 어떻게 되나요?', time: '10:05' },
      {
        id: 2,
        sender: 'admin',
        text: '안녕하세요! 해당 상품 유통기한은 제조일로부터 2년입니다.',
        time: '10:32',
      },
      { id: 3, sender: 'user', text: '감사합니다!', time: '10:35' },
    ],
  },
  {
    id: 3,
    title: '환불 요청',
    customer: '박요리',
    target: '관리자',
    date: '2024.05.27',
    state: '처리중',
    messages: [
      {
        id: 1,
        sender: 'user',
        text: '상품이 파손된 채로 도착했습니다. 환불 부탁드립니다.',
        time: '09:11',
      },
      {
        id: 2,
        sender: 'admin',
        text: '불편을 드려 죄송합니다. 환불 처리 진행 중입니다. 잠시만 기다려 주세요.',
        time: '09:45',
      },
    ],
  },
];

export default function InquiryPage() {
  const [search, setSearch] = useState('');
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = inquiries.filter((i) => i.title.includes(search) || i.customer.includes(search));

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) ?? null;

  function openChat(id: number) {
    setSelectedId(id);
    setInputText('');
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, unread: undefined } : i)));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function sendMessage() {
    const text = inputText.trim();
    if (!text || !selectedId) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id !== selectedId) return i;
        const newMessages: Message[] = [
          ...i.messages,
          { id: i.messages.length + 1, sender: 'admin', text, time },
        ];
        const newState: InquiryState = i.state === '답변대기' ? '처리중' : i.state;
        return { ...i, messages: newMessages, state: newState };
      })
    );
    setInputText('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function markDone() {
    if (!selectedId) return;
    setInquiries((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, state: '답변완료' } : i))
    );
  }

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
          <p className="text-sm text-muted-foreground">전체: {inquiries.length}개</p>
        </div>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 대기</p>
            <p className="text-3xl font-bold text-yellow mt-1">
              {inquiries.filter((i) => i.state === '답변대기').length}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">처리 중</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {inquiries.filter((i) => i.state === '처리중').length}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">답변 완료</p>
            <p className="text-3xl font-bold mt-1">
              {inquiries.filter((i) => i.state === '답변완료').length}건
            </p>
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
              <TableHead className="hidden md:table-cell">고객</TableHead>
              <TableHead className="hidden md:table-cell">대상</TableHead>
              <TableHead className="hidden md:table-cell">날짜</TableHead>
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
                <TableCell className="hidden md:table-cell text-muted-foreground">{inq.customer}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="flex items-center gap-1 text-muted-foreground text-sm">
                    {inq.target === '관리자' ? <User size={14} /> : <Store size={14} />}
                    {inq.target}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{inq.date}</TableCell>
                <TableCell>
                  <StatusBadge status={inq.state} />
                </TableCell>
                <TableCell>
                  <button
                    className="text-primary hover:text-primary/70 transition-colors"
                    aria-label="채팅 열기"
                    onClick={() => openChat(inq.id)}
                  >
                    <Eye size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 채팅 부분 sheet */}
      <Sheet open={!!selectedInquiry} onOpenChange={() => setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:w-105 flex flex-col p-0">
          {selectedInquiry && (
            <>
              {/* 헤더 */}
              <SheetHeader className="px-5 pt-5 pb-3 border-b space-y-2">
                <SheetTitle className="text-base font-semibold">{selectedInquiry.title}</SheetTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedInquiry.customer}</span>
                    <span>·</span>
                    <span>{selectedInquiry.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedInquiry.state} />
                    {selectedInquiry.state !== '답변완료' && (
                      <button
                        onClick={markDone}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        완료 처리
                      </button>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {selectedInquiry.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {msg.sender === 'admin' ? '관리자' : selectedInquiry.customer}
                    </span>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        msg.sender === 'admin'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-beige text-foreground rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* 입력창 */}
              <div className="border-t px-4 py-3 flex gap-2 items-end bg-white">
                <Input
                  className="flex-1 resize-none"
                  placeholder={
                    selectedInquiry.state === '답변완료'
                      ? '답변이 완료된 문의입니다'
                      : '답변을 입력하세요...'
                  }
                  value={inputText}
                  disabled={selectedInquiry.state === '답변완료'}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  disabled={!inputText.trim() || selectedInquiry.state === '답변완료'}
                  onClick={sendMessage}
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

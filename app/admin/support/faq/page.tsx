'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FaqCategory = '전체' | '배송' | '환불' | '상품' | '회원' | '결제';
type FaqStatus = '공개' | '비공개';

interface Faq {
  id: number;
  category: Exclude<FaqCategory, '전체'>;
  title: string;
  views: number;
  date: string;
  status: FaqStatus;
}

const categoryBadge: Record<Exclude<FaqCategory, '전체'>, string> = {
  배송: 'bg-blue-100 text-blue-700',
  환불: 'bg-red-100 text-red-700',
  상품: 'bg-green-100 text-green-700',
  회원: 'bg-yellow-100 text-yellow-700',
  결제: 'bg-purple-100 text-purple-700',
};

const CATEGORIES: FaqCategory[] = ['전체', '배송', '환불', '상품', '회원', '결제'];

const initialFaqs: Faq[] = [
  { id: 1, category: '배송', title: '배송은 얼마나 걸리나요?', views: 1245, date: '2024.05.20', status: '공개' },
  { id: 2, category: '환불', title: '환불은 어떻게 하나요?', views: 892, date: '2024.05.18', status: '공개' },
  { id: 3, category: '상품', title: '상품 재고는 어떻게 확인하나요?', views: 567, date: '2024.05.15', status: '공개' },
  { id: 4, category: '회원', title: '회원 탈퇴는 어떻게 하나요?', views: 234, date: '2024.05.10', status: '비공개' },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('전체');
  const [search, setSearch] = useState('');

  const filtered = faqs.filter((f) => {
    const matchCategory = activeCategory === '전체' || f.category === activeCategory;
    const matchSearch = f.title.includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/support" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">FAQ 관리</h1>
            <p className="text-sm text-muted-foreground">전체: {faqs.length}개</p>
          </div>
        </div>
        <Button size="sm" className="gap-1">
          <Plus size={14} />
          FAQ 추가
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap p-4 bg-white rounded-md border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-beige text-foreground hover:bg-primary/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 bg-white"
          placeholder="질문 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>카테고리</TableHead>
              <TableHead>질문</TableHead>
              <TableHead>조회수</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((faq) => (
              <TableRow key={faq.id}>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${categoryBadge[faq.category]}`}>
                    {faq.category}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{faq.title}</TableCell>
                <TableCell className="text-muted-foreground">{faq.views.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{faq.date}</TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    faq.status === '공개' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {faq.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button className="text-primary" aria-label="상세보기">
                      <Eye size={15} />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground" aria-label="수정">
                      <Pencil size={15} />
                    </button>
                    <button
                      className="text-red"
                      aria-label="삭제"
                      onClick={() => setFaqs((prev) => prev.filter((f) => f.id !== faq.id))}
                    >
                      <Trash2 size={15} />
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

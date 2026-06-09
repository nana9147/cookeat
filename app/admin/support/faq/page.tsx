'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Pencil, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type FaqCategory = '전체' | '배송' | '환불' | '상품' | '회원' | '결제';
type FaqStatus = '공개' | '비공개';

interface Faq {
  id: number;
  category: Exclude<FaqCategory, '전체'>;
  title: string;
  content: string;
  views: number;
  date: string;
  status: FaqStatus;
}

const categoryBadge: Record<Exclude<FaqCategory, '전체'>, string> = {
  배송: 'bg-blue-100 text-blue-700',
  환불: 'bg-red-100 text-red',
  상품: 'bg-green-100 text-green-700',
  회원: 'bg-yellow-100 text-yellow',
  결제: 'bg-purple-100 text-purple-700',
};

const CATEGORIES: FaqCategory[] = ['전체', '배송', '환불', '상품', '회원', '결제'];
const FAQ_CATEGORIES = CATEGORIES.filter((c): c is Exclude<FaqCategory, '전체'> => c !== '전체');

const initialFaqs: Faq[] = [
  {
    id: 1,
    category: '배송',
    title: '배송은 얼마나 걸리나요?',
    content: '일반적으로 2~3 영업일 내에 배송됩니다.',
    views: 1245,
    date: '2024.05.20',
    status: '공개',
  },
  {
    id: 2,
    category: '환불',
    title: '환불은 어떻게 하나요?',
    content: '마이페이지 > 주문내역에서 환불 신청이 가능합니다.',
    views: 892,
    date: '2024.05.18',
    status: '공개',
  },
  {
    id: 3,
    category: '상품',
    title: '상품 재고는 어떻게 확인하나요?',
    content: '상품 상세 페이지에서 재고를 확인할 수 있습니다.',
    views: 567,
    date: '2024.05.15',
    status: '공개',
  },
  {
    id: 4,
    category: '회원',
    title: '회원 탈퇴는 어떻게 하나요?',
    content: '마이페이지 > 설정 > 회원 탈퇴 메뉴를 이용해 주세요.',
    views: 234,
    date: '2024.05.10',
    status: '비공개',
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('전체');
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Faq, 'id' | 'views' | 'date'>>({
    category: '배송',
    title: '',
    content: '',
    status: '공개',
  });
  const [editTarget, setEditTarget] = useState<Faq | null>(null);
  const [editForm, setEditForm] = useState<Faq | null>(null);

  const handleAddSave = () => {
    const newFaq: Faq = {
      ...addForm,
      id: Math.max(0, ...faqs.map((f) => f.id)) + 1,
      views: 0,
      date: new Date()
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\. /g, '.')
        .replace('.', ''),
    };
    setFaqs((prev) => [...prev, newFaq]);
    setAddForm({ category: '배송', title: '', content: '', status: '공개' });
    setAddOpen(false);
  };

  const handleEditOpen = (faq: Faq) => {
    setEditTarget(faq);
    setEditForm({ ...faq });
  };

  const handleEditSave = () => {
    if (!editForm) return;
    setFaqs((prev) => prev.map((f) => (f.id === editForm.id ? editForm : f)));
    setEditTarget(null);
  };

  const filtered = faqs.filter((f) => {
    const matchCategory = activeCategory === '전체' || f.category === activeCategory;
    const matchSearch = f.title.includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/support"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">FAQ 관리</h1>
            <p className="text-sm text-muted-foreground">전체: {faqs.length}개</p>
          </div>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
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
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
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
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${categoryBadge[faq.category]}`}
                  >
                    {faq.category}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{faq.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {faq.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">{faq.date}</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      faq.status === '공개'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {faq.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="수정"
                      onClick={() => handleEditOpen(faq)}
                    >
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

      {/* FAQ 추가 Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>FAQ 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">카테고리</label>
              <Select
                value={addForm.category}
                onValueChange={(v) =>
                  setAddForm((prev) => ({ ...prev, category: v as Faq['category'] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">질문</label>
              <Input
                placeholder="질문을 입력하세요"
                value={addForm.title}
                onChange={(e) => setAddForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">답변</label>
              <Textarea
                placeholder="답변을 입력하세요"
                className="min-h-28 resize-none"
                value={addForm.content}
                onChange={(e) => setAddForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">공개 여부</label>
              <Select
                value={addForm.status}
                onValueChange={(v) => setAddForm((prev) => ({ ...prev, status: v as FaqStatus }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="공개 여부 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="공개">공개</SelectItem>
                  <SelectItem value="비공개">비공개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddSave}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ 수정 Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>FAQ 수정</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">카테고리</label>
                <Select
                  value={editForm?.category}
                  onValueChange={(v) =>
                    setEditForm((prev) => prev && { ...prev, category: v as Faq['category'] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">질문</label>
                <Input
                  value={editForm?.title ?? ''}
                  onChange={(e) =>
                    setEditForm((prev) => prev && { ...prev, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">답변</label>
                <Textarea
                  value={editForm?.content ?? ''}
                  onChange={(e) =>
                    setEditForm((prev) => prev && { ...prev, content: e.target.value })
                  }
                  className="min-h-28 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">공개 여부</label>
                <Select
                  value={editForm?.status}
                  onValueChange={(v) =>
                    setEditForm((prev) => prev && { ...prev, status: v as FaqStatus })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="공개">공개</SelectItem>
                    <SelectItem value="비공개">비공개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              취소
            </Button>
            <Button onClick={handleEditSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

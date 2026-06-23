'use client';

import { useState, useEffect } from 'react';
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
import StatusBadge from '@/components/common/StatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

type FaqCategory = '전체' | '배송' | '환불' | '상품' | '회원' | '결제';

interface Faq {
  faq_id: number;
  category: Exclude<FaqCategory, '전체'>;
  title: string;
  content: string;
  views: number;
  is_public: boolean;
  created_at: string;
}

const CATEGORIES: FaqCategory[] = ['전체', '배송', '환불', '상품', '회원', '결제'];
const FAQ_CATEGORIES = CATEGORIES.filter((c): c is Exclude<FaqCategory, '전체'> => c !== '전체');

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('전체');
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Faq, 'faq_id' | 'views' | 'created_at'>>({
    category: '배송',
    title: '',
    content: '',
    is_public: true,
  });
  const [editTarget, setEditTarget] = useState<Faq | null>(null);
  const [editForm, setEditForm] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaq() {
      try {
        setLoading(true);
        const res = await api.get('/admin/faqs');
        setFaqs(res.data.faqs);
      } catch (err) {
        console.error('FAQ 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaq();
  }, []);

  const handleAddSave = async () => {
    await api
      .post('/admin/faqs', {
        category: addForm.category,
        title: addForm.title,
        content: addForm.content,
        is_public: addForm.is_public,
      })
      .then((res) => {
        setFaqs((prev) => [...prev, res.data.faq]);
        setAddForm({ category: '배송', title: '', content: '', is_public: true });
        setAddOpen(false);
      });
  };

  const handleEditOpen = (faq: Faq) => {
    setEditTarget(faq);
    setEditForm({ ...faq });
  };

  const handleEditSave = async () => {
    if (!editForm) return;
    await api.patch(`/admin/faqs/${editForm.faq_id}`, {
      category: editForm.category,
      title: editForm.title,
      content: editForm.content,
      is_public: editForm.is_public,
    });
    setFaqs((prev) => prev.map((f) => (f.faq_id === editForm.faq_id ? editForm : f)));
    setEditTarget(null);
  };

  const handleDelete = async (faqId: number) => {
    await api.delete(`/admin/faqs/${faqId}`);
    setFaqs((prev) => prev.filter((f) => f.faq_id !== faqId));
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
              <TableHead className="hidden md:table-cell">카테고리</TableHead>
              <TableHead>질문</TableHead>
              <TableHead className="hidden md:table-cell">조회수</TableHead>
              <TableHead className="hidden md:table-cell">작성일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((faq) => (
              <TableRow key={faq.faq_id}>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge status={faq.category} />
                </TableCell>
                <TableCell className="font-medium">{faq.title}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {faq.views.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {faq.created_at}
                </TableCell>
                <TableCell>
                  <StatusBadge status={faq.is_public ? '공개' : '비공개'} />
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
                      onClick={() => handleDelete(faq.faq_id)}
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
                value={addForm.is_public ? '공개' : '비공개'}
                onValueChange={(v) => setAddForm((prev) => ({ ...prev, is_public: v === '공개' }))}
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
                  value={editForm?.is_public ? '공개' : '비공개'}
                  onValueChange={(v) =>
                    setEditForm((prev) => prev && { ...prev, is_public: v === '공개' })
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

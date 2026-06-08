'use client';

import { useState } from 'react';
import { Pencil, Ban } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface Category {
  id: number;
  name: string;
  product: number;
  sort: number;
}

const initialCategories: Category[] = [
  { id: 1, name: '신선한 마켓', product: 234, sort: 1 },
  { id: 2, name: '채소나라', product: 156, sort: 2 },
  { id: 3, name: '정육점', product: 78, sort: 3 },
  { id: 4, name: '자연농원', product: 189, sort: 4 },
];

interface AddCategoryForm {
  name: string;
  sort: number;
  parent: string;
  active: boolean;
}

const defaultForm: AddCategoryForm = {
  name: '',
  sort: 1,
  parent: '',
  active: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddCategoryForm>(defaultForm);

  function handleOpen() {
    setEditingId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      sort: category.sort,
      parent: '',
      active: true,
    });
    setOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    if (editingId !== null) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, name: form.name, sort: form.sort } : c))
      );
    } else {
      const newId = Math.max(...categories.map((c) => c.id)) + 1;
      setCategories((prev) => [
        ...prev,
        { id: newId, name: form.name, product: 0, sort: form.sort },
      ]);
    }
    setOpen(false);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <p className="text-sm text-muted-foreground">전체 카테고리: {categories.length}개</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary text-white gap-1.5"
          onClick={handleOpen}
        >
          카테고리 추가
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>카테고리명</TableHead>
              <TableHead>상품수</TableHead>
              <TableHead>정렬순서</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.product}개</TableCell>
                <TableCell className="text-muted-foreground">{c.sort}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button
                      className="text-gray-text"
                      aria-label="수정"
                      onClick={() => handleEdit(c)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-500"
                      aria-label="삭제"
                      onClick={() => setCategories((prev) => prev.filter((cat) => cat.id !== c.id))}
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{editingId !== null ? '카테고리 수정' : '카테고리 추가'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">기본 정보</p>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  카테고리명 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="카테고리명을 입력하세요"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  정렬 순서 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.sort}
                  onChange={(e) => setForm((f) => ({ ...f, sort: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">상위 카테고리</label>
              <select
                value={form.parent}
                onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">없음 (최상위)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{form.active ? '활성화' : '비활성화'}</p>
                <p className="text-xs text-muted-foreground">
                  비활성화 시 사용자에게 표시되지 않습니다
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  form.active ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingId !== null ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

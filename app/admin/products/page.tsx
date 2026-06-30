'use client';

import { Eye, Pencil, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { getPageNumbers } from '@/lib/utils';
import { formatWon } from '@/lib/format';
import type { AdminProduct, AdminProductStatus } from '@/types/admin';

const PAGE_SIZE = 20;
const PARENT_CATEGORIES = [
  { id: 1, label: '채소' },
  { id: 2, label: '과일' },
  { id: 3, label: '수산물' },
  { id: 4, label: '육류' },
  { id: 5, label: '가공식품' },
  { id: 6, label: '유제품' },
] as const;
const STATUSES: AdminProductStatus[] = ['판매중', '품절', '숨김'];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [productList, setProductList] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterParentId, setFilterParentId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<AdminProductStatus | 'all'>('all');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: String(PAGE_SIZE),
        };
        if (debouncedSearch) params.keyword = debouncedSearch;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (filterParentId !== 'all') params.parentId = filterParentId;

        const { data } = await api.get('/admin/products', { params });
        if (!cancelled) {
          setProductList(data.products as AdminProduct[]);
          setTotal(data.pagination.total as number);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filterStatus, filterParentId, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleFilterStatusChange(value: AdminProductStatus | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  function handleFilterParentIdChange(value: string) {
    setFilterParentId(value);
    setPage(1);
  }

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    await api.patch(`/admin/products/${editProduct.productId}`, { status: editProduct.status });
    setProductList((prev) =>
      prev.map((p) => (p.productId === editProduct.productId ? editProduct : p))
    );
    setEditProduct(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <p className="text-sm text-muted-foreground">전체 상품: {total.toLocaleString()}개</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <Filter size={14} />
          필터
        </Button>
      </div>

      {showFilter && (
        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-white p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">상태</span>
            <Select
              value={filterStatus}
              onValueChange={(v) => handleFilterStatusChange(v as AdminProductStatus | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">카테고리</span>
            <Select value={filterParentId} onValueChange={handleFilterParentIdChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {PARENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9"
          placeholder="판매자명, 상품명으로 검색"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead className="hidden md:table-cell">판매자</TableHead>
              <TableHead className="hidden lg:table-cell">카테고리</TableHead>
              <TableHead className="hidden md:table-cell">가격</TableHead>
              <TableHead className="hidden lg:table-cell">재고</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : productList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              productList.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{p.sellerName}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{p.categoryName ?? '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatWon(p.price)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{p.stock}개</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        className="text-primary"
                        aria-label="상세보기"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-gray-text"
                        aria-label="수정"
                        onClick={() => setEditProduct({ ...p })}
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="text-sm text-muted-foreground">
          {total}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}개
        </div>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품명</span>
                <span className="font-medium">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">카테고리</span>
                <span>{selectedProduct.categoryName ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매자</span>
                <span>{selectedProduct.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매가</span>
                <span>{formatWon(selectedProduct.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">재고</span>
                <span>{selectedProduct.stock}개</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <StatusBadge status={selectedProduct.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>상품 정보 수정</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">판매 상태</label>
                <Select
                  value={editProduct.status}
                  onValueChange={(v) =>
                    setEditProduct({ ...editProduct, status: v as AdminProductStatus })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

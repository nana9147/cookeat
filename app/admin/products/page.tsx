'use client';

import { Eye, Pencil, Ban, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect, useRef } from 'react';
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

const PAGE_SIZE = 20;
const CATEGORIES = ['채소', '과일', '육류', '수산물', '유제품', '가공식품', '기타'];
const STATUSES = ['판매중', '품절', '숨김'] as const;
type Status = (typeof STATUSES)[number];

interface Product {
  productId: number;
  name: string;
  sellerName: string;
  category: string | null;
  price: number;
  stock: number;
  status: Status;
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [productList, setProductList] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

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
        if (filterCategory !== 'all') params.category = filterCategory;

        const { data } = await api.get('/admin/products', { params });
        if (!cancelled) {
          setProductList(data.products as Product[]);
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
  }, [debouncedSearch, filterStatus, filterCategory, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function getPageNumbers(): (number | string)[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  function handleFilterStatusChange(value: Status | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  function handleFilterCategoryChange(value: string) {
    setFilterCategory(value);
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

  const handleDelete = async (productId: number) => {
    await api.delete(`/admin/products/${productId}`);
    setProductList((prev) => prev.filter((p) => p.productId !== productId));
    setTotal((prev) => prev - 1);
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
              onValueChange={(v) => handleFilterStatusChange(v as Status | 'all')}
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
            <Select value={filterCategory} onValueChange={handleFilterCategoryChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead>판매자</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>재고</TableHead>
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
                  <TableCell className="text-muted-foreground">{p.sellerName}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category ?? '-'}</TableCell>
                  <TableCell>{p.price.toLocaleString()}원</TableCell>
                  <TableCell>{p.stock}개</TableCell>
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
                      <button
                        className="text-red"
                        aria-label="삭제"
                        onClick={() => handleDelete(p.productId)}
                      >
                        <Ban size={16} />
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
        getPageNumbers={getPageNumbers}
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
                <span>{selectedProduct.category ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매자</span>
                <span>{selectedProduct.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매가</span>
                <span>{selectedProduct.price.toLocaleString()}원</span>
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
                  onValueChange={(v) => setEditProduct({ ...editProduct, status: v as Status })}
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

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
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = '판매중' | '품절' | '판매중지';

const CATEGORIES = ['채소', '과일', '육류', '수산물', '유제품', '가공식품', '기타'];

interface Product {
  id: number;
  seller: string;
  name: string;
  category: string;
  cost: number;
  stock: number;
  status: Status;
}

const product: Product[] = [
  {
    id: 1,
    seller: '신선한 마켓',
    name: '신선한 양파',
    category: '채소',
    cost: 3500,
    stock: 150,
    status: '판매중',
  },
  {
    id: 2,
    seller: '채소나라',
    name: '국내산 대파',
    category: '채소',
    cost: 2800,
    stock: 0,
    status: '품절',
  },
  {
    id: 3,
    seller: '정육점',
    name: '프리미엄 소고기',
    category: '육류',
    cost: 28000,
    stock: 4,
    status: '판매중지',
  },
  {
    id: 4,
    seller: '자연농원',
    name: '유기농 당근',
    category: '채소',
    cost: 4200,
    stock: 203,
    status: '판매중',
  },
];

const statusBadge: Record<Status, string> = {
  판매중: 'bg-primary text-white',
  품절: 'bg-red text-white',
  판매중지: 'bg-red text-white',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [productList, setProductList] = useState<Product[]>(product);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (product: Product) => {
    setEditProduct({ ...product });
  };

  const filtered = productList.filter((p) => {
    const matchSearch = p.seller.includes(search) || p.name.includes(search);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <p className="text-sm text-muted-foreground">전체 상품: 234개</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 ${showFilter}`}
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
              onValueChange={(v) => setFilterStatus(v as Status | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="판매중">판매중</SelectItem>
                <SelectItem value="품절">품절</SelectItem>
                <SelectItem value="판매중지">판매중지</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">카테고리</span>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="채소">채소</SelectItem>
                <SelectItem value="과일">과일</SelectItem>
                <SelectItem value="육류">육류</SelectItem>
                <SelectItem value="수산물">수산물</SelectItem>
                <SelectItem value="유제품">유제품</SelectItem>
                <SelectItem value="가공식품">가공식품</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
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
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.seller}</TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell>{p.cost}원</TableCell>
                <TableCell>{p.stock}개</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[p.status]}`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button
                      className="text-primary"
                      aria-label="상세보기"
                      onClick={() => handleViewDetail(p)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-gray-text "
                      aria-label="수정"
                      onClick={() => handleEdit(p)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red "
                      aria-label="정지"
                      onClick={() =>
                        setProductList((prev) => prev.filter((item) => item.id !== p.id))
                      }
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
                <span>{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매자</span>
                <span>{selectedProduct.seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매가</span>
                <span>{selectedProduct.cost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">재고</span>
                <span>{selectedProduct.stock}개</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[selectedProduct.status]}`}
                >
                  {selectedProduct.status}
                </span>
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
                <label className="text-sm font-medium">카테고리</label>
                <Select
                  value={editProduct.category}
                  onValueChange={(v) => setEditProduct({ ...editProduct, category: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    {(['판매중', '품절', '판매중지'] as Status[]).map((s) => (
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
            <Button
              onClick={() => {
                if (!editProduct) return;
                setProductList((prev) =>
                  prev.map((p) => (p.id === editProduct.id ? editProduct : p))
                );
                setEditProduct(null);
              }}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

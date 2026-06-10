'use client';

import { Eye, Pencil, Ban, Filter } from 'lucide-react';
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
    stock: 89,
    status: '판매중',
  },
  {
    id: 3,
    seller: '정육점',
    name: '프리미엄 소고기',
    category: '육류',
    cost: 28000,
    stock: 0,
    status: '품절',
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
  const [productList, setProductList] = useState<Product[]>(product);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleEdit = (product: Product) => {
    setEditProduct({ ...product });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <p className="text-sm text-muted-foreground">전체 상품: 234개</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter size={14} />
          필터
        </Button>
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
            {productList.map((p) => (
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

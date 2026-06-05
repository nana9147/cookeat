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
import { Button } from '@/components/ui/button';

type Status = '판매중' | '품절';

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
};

export default function MembersPage() {
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

      <div className="rounded-md border bg-white">
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
            {product.map((p) => (
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
                    <button className="text-primary" aria-label="상세보기">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-text " aria-label="수정">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-500 " aria-label="정지">
                      <Ban size={16} />
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

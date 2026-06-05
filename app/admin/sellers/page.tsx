'use client';

import { Eye, Pencil, Ban, Filter, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type Status = '승인' | '대기';

interface Seller {
  id: number;
  number: string;
  name: string;
  charge: string;
  joinedAt: string;
  productCount: number;
  rating: number;
  status: Status;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={14} className="fill-yellow-400 text-yellow-400" />
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

const seller: Seller[] = [
  {
    id: 1,
    number: '123-45-67890',
    name: '신선마켓',
    charge: '15%',
    joinedAt: '2024.05.20',
    productCount: 12,
    rating: 4.5,
    status: '승인',
  },
  {
    id: 2,
    number: '234-56-78901',
    name: '채소나라',
    charge: '15%',
    joinedAt: '2024.05.20',
    productCount: 12,
    rating: 4.5,
    status: '승인',
  },
  {
    id: 3,
    number: '345-67-89012',
    name: '정육점',
    charge: '15%',
    joinedAt: '2024.05.20',
    productCount: 12,
    rating: 4.5,
    status: '승인',
  },
  {
    id: 4,
    number: '456-78-90123',
    name: '자연농원',
    charge: '15%',
    joinedAt: '2024.05.20',
    productCount: 12,
    rating: 4.5,
    status: '승인',
  },
];

const statusBadge: Record<Status, string> = {
  승인: 'bg-primary text-white',
  대기: 'bg-red text-white',
};

export default function MembersPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">판매자 관리</h1>
          <p className="text-sm text-muted-foreground">전체 판매자: 156명</p>
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
              <TableHead>판매자명</TableHead>
              <TableHead>사업자번호</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>상품수</TableHead>
              <TableHead>평점</TableHead>
              <TableHead>수수료율</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seller.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.number}</TableCell>
                <TableCell className="text-muted-foreground">{s.joinedAt}</TableCell>
                <TableCell>{s.productCount}건</TableCell>
                <TableCell>
                  <StarRating rating={s.rating} />
                </TableCell>
                <TableCell>{s.charge}</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[s.status]}`}
                  >
                    {s.status}
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

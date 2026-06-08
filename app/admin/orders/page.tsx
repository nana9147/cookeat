'use client';

import { Eye, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type Status = '배송중' | '결제완료' | '배송완료' | '취소';

interface Order {
  id: number;
  orderNumber: string;
  name: string;
  orderDate: string;
  product: number;
  cost: number;
  status: Status;
}

const order: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    name: '김쿡잇',
    orderDate: '2026.06.04',
    product: 6,
    cost: 18000,
    status: '배송중',
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    name: '이레시피',
    orderDate: '2026.06.04',
    product: 4,
    cost: 19000,
    status: '결제완료',
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    name: '박요리',
    orderDate: '2026.06.04',
    product: 3,
    cost: 8000,
    status: '취소',
  },
  {
    id: 4,
    orderNumber: 'ORD-004',
    name: '최맛있',
    orderDate: '2026.06.04',
    product: 7,
    cost: 38000,
    status: '배송완료',
  },
];

const statusBadge: Record<Status, string> = {
  결제완료: 'bg-primary text-white',
  배송중: 'bg-yellow text-white',
  배송완료: 'bg-muted text-white',
  취소: 'bg-red text-white',
};

export default function MembersPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 관리</h1>
          <p className="text-sm text-muted-foreground">오늘 주문: 234건</p>
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
              <TableHead>주문번호</TableHead>
              <TableHead>주문자</TableHead>
              <TableHead>주문일시</TableHead>
              <TableHead>상품수</TableHead>
              <TableHead>결제금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.orderNumber}</TableCell>
                <TableCell className="text-muted-foreground">{o.name}</TableCell>
                <TableCell className="text-muted-foreground">{o.orderDate}</TableCell>
                <TableCell>{o.product}개</TableCell>
                <TableCell>{o.cost}원</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[o.status]}`}
                  >
                    {o.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button className="text-primary" aria-label="상세보기">
                      <Eye size={16} />
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

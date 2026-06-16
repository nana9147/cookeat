'use client';

import type { SettlementTableProps } from '@/types/seller/settlement';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '../StatusBadge';

export default function SettlementTable({ data }: SettlementTableProps) {
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    data,
    10
  );

  return (
    <div className=" bg-white border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-beige">
            <TableHead className="text-center text-gray-text font-medium">정산 기간</TableHead>
            <TableHead className="text-center text-gray-text font-medium">총 판매액</TableHead>
            <TableHead className="text-center text-gray-text font-medium">수수료</TableHead>
            <TableHead className="text-center text-gray-text font-medium">물류 비용</TableHead>
            <TableHead className="text-center text-gray-text font-medium">정산 금액</TableHead>
            <TableHead className="text-center text-gray-text font-medium">정산일</TableHead>
            <TableHead className="text-center text-gray-text font-medium">상태</TableHead>
            <TableHead className="text-center text-gray-text font-medium">상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((item) => (
            <TableRow key={item.id} className="text-center hover:bg-beige/50 transition-colors">
              <TableCell className="font-medium text-dark-text">{item.period}</TableCell>
              <TableCell className="text-dark-text">
                {item.totalSalesAmount.toLocaleString()}원
              </TableCell>
              <TableCell className="text-red">-{item.commission.toLocaleString()}원</TableCell>
              <TableCell className="text-red">-{item.shippingFee.toLocaleString()}원</TableCell>
              <TableCell className="font-semibold text-dark-text">
                {item.settlementAmount.toLocaleString()}원
              </TableCell>
              <TableCell className="text-gray-text">{item.settlementDate}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log(item.id)}
                  className="text-xs"
                >
                  보기
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="py-4 border-t border-border">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          getPageNumbers={getPageNumbers}
        />
      </div>
    </div>
  );
}

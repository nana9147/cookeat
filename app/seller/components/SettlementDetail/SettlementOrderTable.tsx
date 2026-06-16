import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SettlementOrderTableProps } from '@/types/seller/settlement';
import StatusBadge from '../StatusBadge';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';

export default function SettlementOrderTable({ orders }: SettlementOrderTableProps) {
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    orders,
    10
  );

  return (
    <Card className="border-border shadow-sm mb-4">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold text-dark-text mb-4">
          주문별 정산 내역 ({orders.length}건)
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-beige">
              <TableHead className="text-center text-gray-text font-medium">주문번호</TableHead>
              <TableHead className="text-center text-gray-text font-medium">상품명</TableHead>
              <TableHead className="text-center text-gray-text font-medium">주문일</TableHead>
              <TableHead className="text-center text-gray-text font-medium">판매금액</TableHead>
              <TableHead className="text-center text-gray-text font-medium">수수료</TableHead>
              <TableHead className="text-center text-gray-text font-medium">물류비</TableHead>
              <TableHead className="text-center text-gray-text font-medium">상태</TableHead>
              <TableHead className="text-center text-gray-text font-medium">정산금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((order) => {
              const isCancelled = order.status === '취소' || order.status === '환불';
              return (
                <TableRow
                  key={order.orderId}
                  className={`text-center h-14 transition-colors ${
                    isCancelled ? 'bg-gray-50 text-light-gray' : 'hover:bg-beige/50'
                  }`}
                >
                  <TableCell className="text-xs text-gray-text font-mono">
                    {order.orderId}
                  </TableCell>
                  <TableCell className="text-sm text-dark-text">{order.productName}</TableCell>
                  <TableCell className="text-sm text-gray-text">{order.orderDate}</TableCell>
                  <TableCell className="text-sm text-dark-text">
                    {order.salesAmount.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-sm text-red">
                    -{order.commission.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-sm text-red">
                    -{order.shippingFee.toLocaleString()}원
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell
                    className={`text-sm font-semibold ${
                      isCancelled ? 'text-light-gray' : 'text-dark-text'
                    }`}
                  >
                    {order.settlementAmount.toLocaleString()}원
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="py-4 border-t border-border mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            getPageNumbers={getPageNumbers}
          />
        </div>
      </CardContent>
    </Card>
  );
}

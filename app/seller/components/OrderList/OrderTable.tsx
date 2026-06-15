'use client';

import type { Order } from '@/types/seller/order';
import StatusBadge from '@/app/seller/components/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';

export default function OrderTable({ orders }: { orders: Order[] }) {
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    orders,
    10
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden py-3">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-center px-5 py-3.5 text-sm font-semibold text-gray-600">
              주문번호
            </th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">고객명</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">상품</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">
              주문금액
            </th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">상태</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">
              주문일시
            </th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">관리</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                주문내역이 없습니다.
              </td>
            </tr>
          ) : (
            <>
              {paginated.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="px-5 py-4 text-sm font-mono text-gray-500">{order.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-800 text-center">{order.customer}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 text-center">{order.product}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-800 text-center">
                    {order.price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center">{order.orderDate}</td>
                  <td className="px-4 py-4 text-center">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button size="sm">상세</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              <EmptyRows count={10 - paginated.length} colSpan={7} />
            </>
          )}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}

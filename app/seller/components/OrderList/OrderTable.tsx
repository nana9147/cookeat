'use client';

import { useEffect } from 'react';
import type { Order } from '@/types/seller/order';
import StatusBadge from '@/app/seller/components/StatusBadge';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function OrderTable({ orders }: { orders: Order[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const paginated = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

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
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">{order.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">{order.customer}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">{order.product}</td>
                  <td className="px-4 py-4 text-sm text-gray-800 text-center">
                    {order.price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">{order.orderDate}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button size="sm">상세</Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {/* 빈 행으로 나머지 채우기 */}
              {Array.from({ length: PAGE_SIZE - paginated.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td colSpan={7} className="py-[30.5px]" />
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ←
          </Button>

          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <span key={i} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(Number(page))}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            →
          </Button>
        </div>
      )}
    </div>
  );
}

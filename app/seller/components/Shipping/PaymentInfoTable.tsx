'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPageNumbers } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyRows from '@/components/ui/EmptyRows';
import { PaymentInfoTableProps, ShippingStatus } from '@/types/seller/shipping';

export default function PaymentInfoTable({
  orders,
  search,
  onSearchChange,
  onStatusChange,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: PaymentInfoTableProps) {
  const actionLabel = '발주확인';
  const nextStatus: ShippingStatus = '배송준비';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="주문번호, 주문자로 검색"
          className="w-64 bg-card"
        />
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              주문번호
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              주문일시
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">주문자</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">수령인</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">연락처</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">배송지</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">상품명</th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              배송메모
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">
              결제금액
            </th>
            <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-600">관리</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                목록을 불러오는 중...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                주문내역이 없습니다.
              </td>
            </tr>
          ) : (
            <>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="px-4 py-3.5 text-sm text-gray-500 text-center font-mono">
                    {order.id}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 text-center">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.recipient}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 text-center">{order.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 text-center">
                    {order.address}, {order.addressDetail}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.products[0]?.name}
                    {order.products.length > 1 && (
                      <span className="text-gray-500"> 외 {order.products.length - 1}건</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 text-center">
                    {order.shippingRequest || '-'}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-800 text-center">
                    {order.finalAmount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Button size="sm" onClick={() => onStatusChange(order.id, nextStatus)}>
                      {actionLabel}
                    </Button>
                  </td>
                </tr>
              ))}
              <EmptyRows count={10 - orders.length} colSpan={9} />
            </>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderProduct } from '@/types/seller/order';

export default function OrderProductSection({ products }: { products: OrderProduct[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>상품 정보</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-500 w-64">
                상품명
              </th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-500 w-24">
                수량
              </th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-500 w-32">
                단가
              </th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-500 w-32">
                합계
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-b-0">
                <td className="px-5 py-4 max-w-0 w-64">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.img}
                      alt={p.itemName}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-800 truncate">{p.itemName}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center text-sm text-gray-600">{p.quantity}개</td>
                <td className="px-5 py-4 text-center text-sm text-gray-600">
                  {p.unitPrice.toLocaleString()}원
                </td>
                <td className="px-5 py-4 text-center text-sm font-bold text-gray-900">
                  {p.itemTotalPrice.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

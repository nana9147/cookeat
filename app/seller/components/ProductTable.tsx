'use client';

import type { Product } from '@/types/seller/product';
import StatusBadge from '@/app/seller/components/StatusBadge';
import { SquarePen, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';

export default function ProductTable({ products }: { products: Product[] }) {
  const { currentPage, setCurrentPage, paginated, totalPages, getPageNumbers } = usePagination(
    products,
    10
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`[${name}] \n\n해당 상품을 정말 삭제하시겠습니까?`)) return;
    console.log('삭제할 상품 id :', id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden py-3">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-center px-5 py-3.5 text-sm font-semibold text-gray-600">상품</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">
              카테고리
            </th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">가격</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">재고</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">
              레시피 연동
            </th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">상태</th>
            <th className="text-center px-4 py-3.5 text-sm font-semibold text-gray-600">관리</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                등록된 상품이 존재하지 않습니다.
              </td>
            </tr>
          ) : (
            <>
              {paginated.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">
                    {product.category}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-800 text-center">
                    {product.price.toLocaleString()}원
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span
                      className={product.stock === 0 ? 'text-red-500 font-medium' : 'text-gray-800'}
                    >
                      {product.stock}개
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 text-center">
                    {product.linkedRecipeCount}개
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2 text-gray-400">
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <SquarePen className="text-dark-text/70" />
                      </Link>
                      <Link href={`/seller/products/${product.id}`}>
                        <Eye />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: 10 - paginated.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td colSpan={7} className="py-[30.5px]" />
                </tr>
              ))}
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

'use client';

import type { Product } from '@/types/seller/product';
import StatusBadge from '@/app/seller/components/StatusBadge';
import { SquarePen, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`[${name}] \n\n해당 상품을 정말 삭제하시겠습니까?`)) return;
    //await fetch(`/api/products/${id}`,{method:"DELETE"});
    console.log('삭제할 상품 id :', id);
  };

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
                상품이 없어요
              </td>
            </tr>
          ) : (
            paginated.map((product) => (
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
                <td className="px-4 py-4 text-sm text-gray-600 text-center">{product.category}</td>
                <td className="px-4 py-4 text-sm text-gray-800 text-center">
                  {product.price.toLocaleString()}원
                </td>
                <td className="px-4 py-4 text-sm text-center">
                  <span
                    className={product.stock === 0 ? 'text-red-500 font-medium ' : 'text-gray-800'}
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
                <td className="px-4 py-4 ">
                  <div className="flex justify-center gap-2 text-gray-400">
                    <button onClick={() => router.push(`/seller/products/${product.id}/edit`)}>
                      <SquarePen className="text-dark-text/70" />
                    </button>
                    <Link href={`/seller/products/${product.id}`}>
                      <Eye />
                    </Link>
                    <button onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
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

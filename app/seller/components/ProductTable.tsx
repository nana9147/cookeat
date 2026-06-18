'use client';

import type { Product } from '@/types/seller/product';
import StatusBadge from '@/app/seller/components/StatusBadge';
import { SquarePen, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import EmptyRows from '@/components/ui/EmptyRows';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductTableProps {
  products: Product[];
  pageSize?: number;
}

export default function ProductTable({ products, pageSize = 10 }: ProductTableProps) {
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`[${name}] \n\n해당 상품을 정말 삭제하시겠습니까?`)) return;
    console.log('삭제할 상품 id :', id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden py-3">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            <TableHead className="text-center text-sm font-semibold text-gray-600">상품</TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">
              카테고리
            </TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">가격</TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">재고</TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">
              레시피 연동
            </TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">상태</TableHead>
            <TableHead className="text-center text-sm font-semibold text-gray-600">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                등록된 상품이 존재하지 않습니다.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {products.map((product) => (
                <TableRow
                  key={product.productId}
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 text-center">
                    {product.categories?.name ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-800 text-center">
                    {product.price.toLocaleString()}원
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    <span
                      className={
                        (product.stock ?? 0) === 0 ? 'text-red-500 font-medium' : 'text-gray-800'
                      }
                    >
                      {product.stock ?? 0}개
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 text-center">
                    {product.linkedRecipeCount}개
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={product.status ?? '판매중'} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2 text-gray-400">
                      <Link href={`/seller/products/${product.productId}/edit`}>
                        <SquarePen className="text-dark-text/70" />
                      </Link>
                      <Link href={`/seller/products/${product.productId}`}>
                        <Eye />
                      </Link>
                      <button onClick={() => handleDelete(product.productId, product.name)}>
                        <Trash2 className="text-red-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <EmptyRows count={Math.max(0, pageSize - products.length)} colSpan={7} />
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

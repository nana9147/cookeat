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
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  pageSize?: number;
}

export default function ProductTable({ products, isLoading = false, pageSize = 10 }: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`[${name}] \n\n해당 상품을 정말 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/seller/products/${id}`);
      toast.success('상품이 삭제되었습니다.');
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '상품 삭제에 실패했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      setDeletingId(null);
    }
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
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={i} className="border-b border-gray-50">
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                  </div>
                </TableCell>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} className="text-center">
                    <div className="h-4 w-16 rounded bg-gray-100 animate-pulse mx-auto" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : products.length === 0 ? (
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
                      {!isAdmin && (
                        <Link href={`/seller/products/${product.productId}/edit`}>
                          <SquarePen className="text-dark-text/70" />
                        </Link>
                      )}
                      <button onClick={() => setPreviewId(product.productId)}>
                        <Eye />
                      </button>
                      {!isAdmin && (
                        <button
                          onClick={() => handleDelete(product.productId, product.name)}
                          disabled={deletingId === product.productId}
                        >
                          <Trash2
                            className={
                              deletingId === product.productId ? 'text-gray-300' : 'text-red-400'
                            }
                          />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <EmptyRows count={Math.max(0, pageSize - products.length)} colSpan={7} />
            </>
          )}
        </TableBody>
      </Table>
      <Dialog open={previewId !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          {previewId !== null && (
            <iframe
              src={`/seller-preview/${previewId}`}
              className="w-full h-full border-0"
              title="상품 상세 미리보기"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

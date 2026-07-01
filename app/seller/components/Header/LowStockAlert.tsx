'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import type { LowStockProduct } from '@/types/seller/product';

const STORAGE_KEY = 'seller_low_stock_seen_ids';

function loadSeenIds(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: number[] = JSON.parse(raw);
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function LowStockAlert() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSeenIds(loadSeenIds());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchLowStock = async () => {
      try {
        const { data } = await api.get('/seller/products/low-stock');
        if (cancelled) return;
        setProducts(data.data);
      } catch {}
    };

    fetchLowStock();
    const interval = setInterval(fetchLowStock, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) return;
    const next = new Set(seenIds);
    for (const p of products) next.add(p.productId);
    setSeenIds(next);
    saveSeenIds(next);
  };

  const unseenCount = products.filter((p) => !seenIds.has(p.productId)).length;
  const showBadge = unseenCount > 0;

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-white" />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-2xs font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
              {unseenCount > 9 ? '9+' : unseenCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          재고 부족 상품 {products.length > 0 && `(${products.length})`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {products.length === 0 ? (
          <p className="text-sm text-gray-400 px-2 py-3 text-center">재고 부족 상품이 없어요.</p>
        ) : (
          products.slice(0, 10).map((p) => (
            <DropdownMenuItem key={p.productId} asChild className="cursor-pointer">
              <Link
                href={`/seller/products/${p.productId}/edit`}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="text-sm font-medium text-gray-800 truncate w-full flex items-center gap-1.5">
                  {p.name}
                  {!seenIds.has(p.productId) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  )}
                </span>
                <span className="text-xs text-red-500">
                  재고 {p.stock}개 (기준 {p.minStock}개)
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        {products.length > 10 && (
          <DropdownMenuItem asChild className="cursor-pointer justify-center text-xs text-gray-500">
            <Link href="/seller/products">전체 보기</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

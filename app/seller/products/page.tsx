'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Plus } from 'lucide-react';
import ProductTable from '@/app/seller/components/ProductTable';
import FilterTabs from '@/app/seller/components/FilterTabs';
import type { CategoryName, ProductStatus, Product } from '@/types/seller/product';
import Link from 'next/link';

// 나중에 API로 교체
const products: Product[] = [
  {
    id: 'veg-0000001',
    name: '신선 토마토 (500g)',
    category: '채소',
    price: 8500,
    stock: 45,
    linkedRecipeCount: 12,
    status: '판매중',
    imageUrl: 'https://cdn-icons-png.flaticon.com/128/15115/15115165.png',
    store: '하나로마트',
    createdAt: '2026-06-05',
  },
  {
    id: 'sau-0000001',
    name: '프리미엄 올리브유',
    category: '오일/소스',
    price: 32000,
    stock: 28,
    linkedRecipeCount: 24,
    status: '판매중',
    imageUrl: 'https://cdn-icons-png.flaticon.com/128/7493/7493117.png',
    store: '하나로마트',
    createdAt: '2026-06-05',
  },
  {
    id: 'veg-0000002',
    name: '유기농 양파 (1kg)',
    category: '채소',
    price: 5500,
    stock: 0,
    linkedRecipeCount: 35,
    status: '품절',
    imageUrl: 'https://cdn-icons-png.flaticon.com/128/862/862847.png',
    store: '하나로마트',
    createdAt: '2026-06-05',
  },
  {
    id: 'dai-0000001',
    name: '생크림 (200ml)',
    category: '유제품',
    price: 4800,
    stock: 62,
    linkedRecipeCount: 18,
    status: '판매중',
    imageUrl: 'https://cdn-icons-png.flaticon.com/128/5816/5816136.png',
    store: '하나로마트',
    createdAt: '2026-06-05',
  },
];

export default function ProductsPage() {
  const [category, setCategory] = useState<CategoryName | '전체'>('전체');
  const [status, setStatus] = useState<ProductStatus | '전체'>('전체');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const suggestions = search ? products.filter((p) => p.name.includes(search)) : [];

  const filtered = products.filter((p) => {
    const matchCategory = category === '전체' || p.category === category;
    const matchStatus = status === '전체' || p.status === status;
    const matchSearch = p.name.includes(search);
    return matchCategory && matchStatus && matchSearch;
  });

  return (
    <div className="bg-background p-8">
      {/* 헤더 */}
      <div className="mb-8 pr-5 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text">상품 관리</h1>
        <Link href="/seller/products/new">
          <Button className="p-5">
            <Plus /> 상품 등록
          </Button>
        </Link>
      </div>

      {/* 검색 */}
      <div className="flex flex-col gap-4 ">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="상품명으로 검색"
              className="py-5"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsSuggestOpen(true);
              }}
              onBlur={() => setTimeout(() => setIsSuggestOpen(false), 150)}
            />

            {isSuggestOpen && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden">
                {suggestions.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onMouseDown={() => {
                      setSearch(p.name);
                      setIsSuggestOpen(false);
                    }}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            variant="outline"
            className="flex items-center gap-1.5 px-4 shrink-0 py-5"
          >
            <Filter />
            필터
          </Button>
        </div>
        {/* 필터 탭 */}
        {isFilterOpen && (
          <FilterTabs
            category={category}
            status={status}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
          />
        )}

        {/* 테이블 */}
        <ProductTable products={filtered} />
      </div>
    </div>
  );
}

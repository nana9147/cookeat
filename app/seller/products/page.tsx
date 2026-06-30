'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Plus } from 'lucide-react';
import ProductTable from '@/app/seller/components/ProductTable';
import FilterTabs from '@/app/seller/components/FilterTabs';
import Pagination from '@/components/ui/Pagination';
import { getPageNumbers } from '@/lib/utils';
import type { ProductStatus, Product, CategoryNode } from '@/types/seller/product';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const statuses: (ProductStatus | '전체')[] = ['전체', '판매중', '품절', '판매종료', '숨김'];
const LIMIT = 10;

export default function ProductsPage() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const [status, setStatus] = useState<ProductStatus | '전체'>('전체');
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: LIMIT };
        if (search) params.keyword = search;
        if (status !== '전체') params.status = status;
        if (selectedCategoryId) params.categoryId = selectedCategoryId;
        else if (selectedParentId) params.parentId = selectedParentId;

        const { data } = await api.get('/seller/products', { params });
        if (data) {
          setProducts(data.data.products);
          setTotal(data.data.pagination.total);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : '상품 목록을 불러오지 못했습니다.';
        toast.error(msg, { id: msg });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page, search, status, selectedParentId, selectedCategoryId]);

  const totalPages = Math.ceil(total / LIMIT);

  const handleSelectParent = (parentId: number | null) => {
    setSelectedParentId(parentId);
    setSelectedCategoryId(null);
    setPage(1);
  };

  const handleSelectChild = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const selectedParent = categories.find((c) => c.categoryId === selectedParentId);

  return (
    <div className="bg-background p-8">
      <div className="mb-8 pr-5 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text">상품 관리</h1>
        {!isAdmin && (
          <Link href="/seller/products/new">
            <Button className="p-5">
              <Plus /> 상품 등록
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="상품명으로 검색"
            className="py-5 bg-card"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            variant="outline"
            className="flex items-center gap-1.5 px-4 shrink-0 py-5 bg-card"
          >
            <Filter />
            필터
          </Button>
        </div>

        {isFilterOpen && (
          <>
            {/* 대카테고리 */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => handleSelectParent(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  selectedParentId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                전체
              </button>
              {categories.map((c) => (
                <button
                  key={c.categoryId}
                  onClick={() => handleSelectParent(c.categoryId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedParentId === c.categoryId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* 소카테고리*/}
            {selectedParent && selectedParent.children.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => handleSelectChild(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedCategoryId === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  전체
                </button>
                {selectedParent.children.map((child) => (
                  <button
                    key={child.categoryId}
                    onClick={() => handleSelectChild(child.categoryId)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      selectedCategoryId === child.categoryId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}

            <FilterTabs
              options={statuses}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />
          </>
        )}

        <p className="text-sm text-gray-500">
          전체 상품 수 <span className="font-semibold text-gray-800">{total}</span>개
        </p>

        <ProductTable products={products} isLoading={isLoading} />
        {!isLoading && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            getPageNumbers={() => getPageNumbers(page, totalPages)}
          />
        )}
      </div>
    </div>
  );
}

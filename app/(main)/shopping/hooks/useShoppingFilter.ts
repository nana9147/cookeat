'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IngredientCategory,
  SortOption,
  ShoppingProduct,
  ProductListItem,
  ProductsResponse,
} from '@/types/ingredient';
import type { CategoryName } from '@/types/ingredient';

const PAGE_SIZE = 12;
const NEW_PRODUCT_DAYS = 30;

function toShoppingProduct(item: ProductListItem): ShoppingProduct {
  const isNew =
    Date.now() - new Date(item.createdAt).getTime() < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
  return {
    id: String(item.productId),
    name: item.name,
    category: item.category as CategoryName,
    price: item.price,
    rating: item.rating,
    reviewCount: item.reviewCount,
    seller: item.seller,
    imageUrl: item.image,
    stock: item.stock,
    isNew,
  };
}

export function useShoppingFilter() {
  const [category, setCategory] = useState<IngredientCategory>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('추천순');
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track previous price values so we only debounce when price fields actually changed,
  // not whenever they happen to be non-empty alongside a category/sort/seller change.
  const prevPriceRef = useRef({ minPrice, maxPrice });

  const resetPage = () => setCurrentPage(1);

  const handleSellerToggle = (seller: string) => {
    setSelectedSellers((prev) =>
      prev.includes(seller) ? prev.filter((s) => s !== seller) : [...prev, seller]
    );
    resetPage();
  };

  const handleReset = () => {
    setCategory('전체');
    setSortOption('추천순');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSellers([]);
    setCurrentPage(1);
  };

  const activeFilterCount =
    (category !== '전체' ? 1 : 0) +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0) +
    (selectedSellers.length > 0 ? 1 : 0);

  useEffect(() => {
    let cancelled = false;

    // 가격 필드 자체가 변경됐을 때만 500ms 디바운스, 나머지는 즉시 요청
    const priceChanged =
      prevPriceRef.current.minPrice !== minPrice || prevPriceRef.current.maxPrice !== maxPrice;
    prevPriceRef.current = { minPrice, maxPrice };
    const delay = priceChanged ? 500 : 0;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
          sort: sortOption,
        });
        if (category !== '전체') params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (selectedSellers.length > 0) params.set('sellers', selectedSellers.join(','));

        const res = await fetch(`/api/products?${params}`);
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        const json: ProductsResponse = await res.json();

        if (!json.success) throw new Error('API 오류가 발생했습니다.');

        if (!cancelled) {
          setProducts(json.data.products.map(toShoppingProduct));
          setSellers(json.data.sellers);
          setTotal(json.data.pagination.total);
        }
      } catch {
        if (!cancelled) setError('상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentPage, category, sortOption, minPrice, maxPrice, selectedSellers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    category,
    setCategory,
    sortOption,
    setSortOption,
    currentPage,
    setCurrentPage,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSellers,
    isFilterOpen,
    setIsFilterOpen,
    resetPage,
    handleSellerToggle,
    handleReset,
    activeFilterCount,
    products,
    sellers,
    total,
    isLoading,
    error,
    totalPages,
  };
}

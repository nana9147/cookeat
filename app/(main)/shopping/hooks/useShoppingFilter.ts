'use client';

import { useMemo, useState } from 'react';
import { IngredientCategory, SortOption } from '@/types/ingredient';
import { mockProducts } from '../data/mockProducts';
import { filterAndSort } from '../utils/shoppingFilter';

const PAGE_SIZE = 12;

export function useShoppingFilter() {
  const [category, setCategory] = useState<IngredientCategory>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('추천순');
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const activeFilterCount = [
    category !== '전체',
    minPrice !== '',
    maxPrice !== '',
    selectedSellers.length > 0,
  ].filter(Boolean).length;

  const filtered = useMemo(
    () => filterAndSort(mockProducts, { category, sortOption, minPrice, maxPrice, selectedSellers }),
    [category, sortOption, minPrice, maxPrice, selectedSellers]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    category, setCategory,
    sortOption, setSortOption,
    currentPage, setCurrentPage,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    selectedSellers,
    isFilterOpen, setIsFilterOpen,
    resetPage,
    handleSellerToggle,
    handleReset,
    activeFilterCount,
    filtered,
    paginated,
    totalPages,
  };
}

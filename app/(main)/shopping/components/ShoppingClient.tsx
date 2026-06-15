'use client';

import { useMemo, useState } from 'react';
import { IngredientCategory, SortOption } from '@/types/ingredient';
import { mockProducts } from '../data/mockProducts';
import { filterAndSort } from '../utils/shoppingFilter';
import ShoppingFilter from './ShoppingFilter';
import ShoppingSort from './ShoppingSort';
import ShoppingGrid from './ShoppingGrid';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 12;
const allSellers = [...new Set(mockProducts.map((p) => p.seller))].sort();

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (currentPage > 3) pages.push('...');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function ShoppingClient() {
  const [category, setCategory] = useState<IngredientCategory>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('추천순');
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);

  const resetPage = () => setCurrentPage(1);

  const handleSellerToggle = (seller: string) => {
    setSelectedSellers((prev) =>
      prev.includes(seller) ? prev.filter((s) => s !== seller) : [...prev, seller]
    );
    resetPage();
  };

  const handleReset = () => {
    setCategory('전체'); setSortOption('추천순');
    setMinPrice(''); setMaxPrice('');
    setSelectedSellers([]); setCurrentPage(1);
  };

  const filtered = useMemo(
    () => filterAndSort(mockProducts, { category, sortOption, minPrice, maxPrice, selectedSellers }),
    [category, sortOption, minPrice, maxPrice, selectedSellers]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="desktop:flex desktop:gap-8">
      <ShoppingFilter
        selectedCategory={category} onCategoryChange={(cat) => { setCategory(cat); resetPage(); }}
        minPrice={minPrice} maxPrice={maxPrice}
        onMinPriceChange={(v) => { setMinPrice(v); resetPage(); }}
        onMaxPriceChange={(v) => { setMaxPrice(v); resetPage(); }}
        sellers={allSellers} selectedSellers={selectedSellers}
        onSellerToggle={handleSellerToggle} onReset={handleReset}
      />
      <div className="flex-1 min-w-0">
        <ShoppingSort
          totalCount={filtered.length} sortOption={sortOption}
          onSortChange={(s) => { setSortOption(s); resetPage(); }}
        />
        <ShoppingGrid products={paginated} />
        <Pagination
          currentPage={currentPage} totalPages={totalPages}
          onPageChange={setCurrentPage}
          getPageNumbers={() => getPageNumbers(currentPage, totalPages)}
        />
      </div>
    </div>
  );
}

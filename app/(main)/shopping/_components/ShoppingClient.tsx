'use client';

import { IngredientCategory } from '@/types/ingredient';
import { useShoppingFilter } from '../hooks/useShoppingFilter';
import ShoppingFilter from './ShoppingFilter';
import ShoppingSort from './ShoppingSort';
import FilterSheet from './FilterSheet';
import ShoppingProductArea from './ShoppingProductArea';

export default function ShoppingClient() {
  const {
    category, setCategory, sortOption, setSortOption,
    currentPage, setCurrentPage, minPrice, setMinPrice, maxPrice, setMaxPrice,
    selectedSellers, isFilterOpen, setIsFilterOpen,
    resetPage, handleSellerToggle, handleReset,
    activeFilterCount, products, sellers, total, isLoading, error, totalPages,
  } = useShoppingFilter();

  const sharedFilterProps = {
    selectedCategory: category,
    onCategoryChange: (cat: IngredientCategory) => { setCategory(cat); resetPage(); },
    minPrice,
    maxPrice,
    onMinPriceChange: (v: string) => { setMinPrice(v); resetPage(); },
    onMaxPriceChange: (v: string) => { setMaxPrice(v); resetPage(); },
    sellers,
    selectedSellers,
    onSellerToggle: handleSellerToggle,
    onReset: handleReset,
  };

  return (
    <>
      <div className="desktop:flex desktop:gap-8">
        <ShoppingFilter {...sharedFilterProps} />
        <div className="flex-1 min-w-0">
          <ShoppingSort
            totalCount={total}
            sortOption={sortOption}
            onSortChange={(s) => { setSortOption(s); resetPage(); }}
            onFilterOpen={() => setIsFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />
          <ShoppingProductArea
            error={error}
            isLoading={isLoading}
            products={products}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <FilterSheet
        {...sharedFilterProps}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilterCount={activeFilterCount}
      />
    </>
  );
}

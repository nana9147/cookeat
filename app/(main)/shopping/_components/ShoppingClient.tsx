'use client';

import { useShoppingFilter } from '../hooks/useShoppingFilter';
import { allSellers, getPageNumbers } from '../utils/shoppingFilter';
import ShoppingFilter from './ShoppingFilter';
import ShoppingSort from './ShoppingSort';
import ShoppingGrid from './ShoppingGrid';
import FilterSheet from './FilterSheet';
import Pagination from '@/components/ui/Pagination';

export default function ShoppingClient() {
  const {
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
  } = useShoppingFilter();

  return (
    <>
      <div className="desktop:flex desktop:gap-8">
        <ShoppingFilter
          selectedCategory={category}
          onCategoryChange={(cat) => { setCategory(cat); resetPage(); }}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={(v) => { setMinPrice(v); resetPage(); }}
          onMaxPriceChange={(v) => { setMaxPrice(v); resetPage(); }}
          sellers={allSellers}
          selectedSellers={selectedSellers}
          onSellerToggle={handleSellerToggle}
          onReset={handleReset}
        />
        <div className="flex-1 min-w-0">
          <ShoppingSort
            totalCount={filtered.length}
            sortOption={sortOption}
            onSortChange={(s) => { setSortOption(s); resetPage(); }}
            onFilterOpen={() => setIsFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />
          <ShoppingGrid products={paginated} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            getPageNumbers={() => getPageNumbers(currentPage, totalPages)}
          />
        </div>
      </div>
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategory={category}
        onCategoryChange={(cat) => { setCategory(cat); resetPage(); }}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={(v) => { setMinPrice(v); resetPage(); }}
        onMaxPriceChange={(v) => { setMaxPrice(v); resetPage(); }}
        sellers={allSellers}
        selectedSellers={selectedSellers}
        onSellerToggle={handleSellerToggle}
        onReset={handleReset}
        activeFilterCount={activeFilterCount}
      />
    </>
  );
}

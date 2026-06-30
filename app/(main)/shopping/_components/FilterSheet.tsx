'use client';

import { IngredientCategory } from '@/types/ingredient';
import FilterCategory from './FilterCategory';
import FilterPrice from './FilterPrice';
import FilterSeller from './FilterSeller';
import FilterSheetHeader from './FilterSheetHeader';
import FilterSheetActions from './FilterSheetActions';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: IngredientCategory;
  onCategoryChange: (category: IngredientCategory) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  sellers: string[];
  selectedSellers: string[];
  onSellerToggle: (seller: string) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export default function FilterSheet({
  isOpen, onClose, selectedCategory, onCategoryChange,
  minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  sellers, selectedSellers, onSellerToggle, onReset, activeFilterCount,
}: FilterSheetProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 desktop:hidden" onClick={onClose} />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[82vh] flex flex-col desktop:hidden transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <FilterSheetHeader activeFilterCount={activeFilterCount} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <FilterCategory selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
          <FilterPrice
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
          <FilterSeller sellers={sellers} selectedSellers={selectedSellers} onSellerToggle={onSellerToggle} />
        </div>
        <FilterSheetActions onReset={onReset} onClose={onClose} />
      </div>
    </>
  );
}

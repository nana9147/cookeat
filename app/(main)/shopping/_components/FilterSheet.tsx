'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { IngredientCategory } from '@/types/ingredient';
import FilterCategory from './FilterCategory';
import FilterPrice from './FilterPrice';
import FilterSeller from './FilterSeller';

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
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sellers,
  selectedSellers,
  onSellerToggle,
  onReset,
  activeFilterCount,
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
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-dark-text">필터</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-text hover:text-dark-text"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 필터 내용 */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <FilterCategory selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
          <FilterPrice
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
          <FilterSeller
            sellers={sellers}
            selectedSellers={selectedSellers}
            onSellerToggle={onSellerToggle}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2.5 px-5 py-4 shrink-0 border-t border-border">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex-1 h-11 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-[2] h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>
    </>
  );
}

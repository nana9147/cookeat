import { IngredientCategory } from '@/types/ingredient';
import FilterCategory from './FilterCategory';
import FilterPrice from './FilterPrice';
import FilterSeller from './FilterSeller';

interface ShoppingFilterProps {
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
}

export default function ShoppingFilter({
  selectedCategory, onCategoryChange,
  minPrice, maxPrice, onMinPriceChange, onMaxPriceChange,
  sellers, selectedSellers, onSellerToggle,
  onReset,
}: ShoppingFilterProps) {
  return (
    <aside className="hidden desktop:block w-52 shrink-0">
      <div className="sticky top-4 space-y-6">
        <FilterCategory selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
        <FilterPrice
          minPrice={minPrice} maxPrice={maxPrice}
          onMinPriceChange={onMinPriceChange} onMaxPriceChange={onMaxPriceChange}
        />
        <FilterSeller sellers={sellers} selectedSellers={selectedSellers} onSellerToggle={onSellerToggle} />
        <button
          onClick={onReset}
          className="w-full h-8 rounded-lg bg-white border border-border text-xs text-dark-text font-medium hover:bg-hover transition-colors"
        >
          필터 초기화
        </button>
      </div>
    </aside>
  );
}

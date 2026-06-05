'use client';

import type { CategoryName, ProductStatus } from '@/types/seller/product';

type FilterTabsProps = {
  category: CategoryName | '전체';
  status: ProductStatus | '전체';
  onCategoryChange: (category: CategoryName | '전체') => void;
  onStatusChange: (status: ProductStatus | '전체') => void;
};

const categories: (CategoryName | '전체')[] = [
  '전체',
  '채소',
  '과일·견과',
  '정육·계란',
  '수산·해산물',
  '쌀·잡곡',
  '유제품',
  '오일/소스',
  '밀키트',
];

const statuses: (ProductStatus | '전체')[] = ['전체', '판매중', '품절', '판매종료'];

export default function FilterTabs({
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: FilterTabsProps) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* 카테고리 */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === c
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 판매 상태 */}
      <div className="flex gap-1.5">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

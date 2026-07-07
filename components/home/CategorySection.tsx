'use client';

import CategoryItem from './CategoryItem';
import { useRecipeCategories } from './useHomeData';

const fallbackCategories = [
  { name: '한식', image: '/images/categories/korean.png' },
  { name: '양식', image: '/images/categories/western.png' },
  { name: '중식', image: '/images/categories/chinese.png' },
  { name: '일식', image: '/images/categories/japanese.png' },
  { name: '디저트', image: '/images/categories/dessert.png' },
  { name: '샐러드', image: '/images/categories/salad.png' },
  { name: '간식', image: '/images/categories/snack.png' },
  { name: '음료', image: '/images/categories/drink.png' },
  { name: '베이킹', image: '/images/categories/baking.png' },
  { name: '기타', image: '/images/categories/etc.png' },
];

const categoryImageMap: Record<string, string> = {
  한식: '/images/categories/korean.png',
  양식: '/images/categories/western.png',
  중식: '/images/categories/chinese.png',
  일식: '/images/categories/japanese.png',
  디저트: '/images/categories/dessert.png',
  샐러드: '/images/categories/salad.png',
  간식: '/images/categories/snack.png',
  음료: '/images/categories/drink.png',
  베이킹: '/images/categories/baking.png',
  식단: '/images/categories/salad.png',
  동남아: '/images/categories/chinese.png',
  분식: '/images/categories/korean.png',
  다이어트: '/images/categories/salad.png',
  술안주: '/images/categories/snack.png',
};

export default function CategorySection() {
  const { categories, isLoading } = useRecipeCategories();
  const visibleCategories = categories.length > 0
    ? categories.map((category) => ({
        name: category.name,
        image: categoryImageMap[category.name] ?? '/images/categories/etc.png',
      }))
    : fallbackCategories;

  return (
    <section className="mt-8">
      <h2 className="text-h4 font-bold text-dark-text mb-4">카테고리</h2>
      <div className="grid grid-cols-5 tablet:grid-cols-8 desktop:grid-cols-10 gap-3">
        {isLoading && categories.length === 0 ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-card-bg animate-pulse" />
              <div className="h-3 w-8 rounded bg-card-bg animate-pulse" />
            </div>
          ))
        ) : visibleCategories.map((category) => (
          <CategoryItem key={category.name} name={category.name} image={category.image} />
        ))}
      </div>
    </section>
  );
}

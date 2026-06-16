import { ShoppingProduct, IngredientCategory, SortOption } from '@/types/ingredient';
import { mockProducts } from '../data/mockProducts';

export const allSellers = [...new Set(mockProducts.map((p) => p.seller))].sort();

export function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (currentPage > 3) pages.push('...');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
    pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

interface FilterOptions {
  category: IngredientCategory;
  sortOption: SortOption;
  minPrice: string;
  maxPrice: string;
  selectedSellers: string[];
}

function getFinalPrice(p: ShoppingProduct): number {
  return p.discountRate ? Math.round(p.price * (1 - p.discountRate / 100)) : p.price;
}

export function filterAndSort(products: ShoppingProduct[], options: FilterOptions): ShoppingProduct[] {
  let list = [...products];

  if (options.category !== '전체') list = list.filter((p) => p.category === options.category);
  if (options.minPrice) list = list.filter((p) => getFinalPrice(p) >= Number(options.minPrice));
  if (options.maxPrice) list = list.filter((p) => getFinalPrice(p) <= Number(options.maxPrice));
  if (options.selectedSellers.length > 0) list = list.filter((p) => options.selectedSellers.includes(p.seller));

  switch (options.sortOption) {
    case '신상품순': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    case '낮은가격순': list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b)); break;
    case '높은가격순': list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a)); break;
    case '별점순': list.sort((a, b) => b.rating - a.rating); break;
  }

  return list;
}

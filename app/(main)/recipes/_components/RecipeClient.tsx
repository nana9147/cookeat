'use client';

import { useState } from 'react';
import { MOCK_RECIPES, RECIPE_CATEGORIES, RecipeCategory, SortType } from '../data/mockRecipes';
import RecipeCategoryTabs from './RecipeCategoryTabs';
import RecipeSortBar from './RecipeSortBar';
import RecipeGrid from './RecipeGrid';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 12;

function getPageNumbers(current: number, total: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const end = Math.min(5, total);
  for (let i = 1; i <= end; i++) pages.push(i);
  if (total > 5) { pages.push('...'); pages.push(total); }
  return pages;
}

export default function RecipeClient() {
  const [category, setCategory] = useState<RecipeCategory>('전체');
  const [sort, setSort] = useState<SortType>('인기순');
  const [page, setPage] = useState(1);

  const filtered = MOCK_RECIPES.filter((r) => category === '전체' || r.category === category);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategory = (c: RecipeCategory) => { setCategory(c); setPage(1); };
  const handleSort = (s: SortType) => { setSort(s); setPage(1); };

  return (
    <>
      <RecipeCategoryTabs selected={category} onChange={handleCategory} />
      <RecipeSortBar total={filtered.length} sort={sort} onSort={handleSort} />
      <RecipeGrid recipes={paged} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />
    </>
  );
}

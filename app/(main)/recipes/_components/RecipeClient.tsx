'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { getPageNumbers } from '@/lib/utils';
import { RecipeCategory, RecipeListItem, SortKey, SORT_OPTIONS } from '../types';
import RecipeCategoryTabs from './RecipeCategoryTabs';
import RecipeSortBar from './RecipeSortBar';
import RecipeGrid from './RecipeGrid';
import Pagination from '@/components/ui/Pagination';

interface RecipesResponse {
  recipes: RecipeListItem[];
  pagination: { page: number; limit: number; total: number; hasNext: boolean };
}

const PAGE_SIZE = 12;

export default function RecipeClient() {
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    api
      .get<{ success: boolean; data: RecipeCategory[] }>('/recipe-categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { sort, page, limit: PAGE_SIZE };
      if (categoryId !== null) params.recipeCategoryId = categoryId;
      const res = await api.get<{ success: boolean; data: RecipesResponse }>('/recipes', {
        params,
      });
      setRecipes(res.data.data.recipes);
      setTotal(res.data.data.pagination.total);
    } catch {
      setRecipes([]);
      setTotal(0);
      setError('레시피를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [sort, page, categoryId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleCategory = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleSort = (s: SortKey) => {
    setSort(s);
    setPage(1);
  };

  return (
    <>
      <RecipeCategoryTabs categories={categories} selectedId={categoryId} onChange={handleCategory} />
      <RecipeSortBar total={total} sort={sort} onSort={handleSort} />
      {error ? (
        <p className="py-20 text-center text-sm text-red-500">{error}</p>
      ) : (
        <RecipeGrid recipes={recipes} loading={loading} />
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />
    </>
  );
}

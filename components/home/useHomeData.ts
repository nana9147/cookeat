'use client';

import { useEffect, useState } from 'react';
import type { HomeRecipe, RecipeCategory } from './types';

type RecipesResponse = {
  success: boolean;
  data?: {
    recipes: HomeRecipe[];
  };
  error?: string;
};

type CategoriesResponse = {
  success: boolean;
  data?: RecipeCategory[];
  error?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T;
  if (!res.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : '요청에 실패했습니다.';
    throw new Error(message);
  }
  return data;
}

export function usePopularRecipes() {
  const [recipes, setRecipes] = useState<HomeRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchJson<RecipesResponse>('/api/recipes?sort=popular&limit=5')
      .then((data) => {
        if (!ignore) setRecipes(data.data?.recipes ?? []);
      })
      .catch(() => {
        if (!ignore) setRecipes([]);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { recipes, isLoading };
}

export function useTodayRecipe() {
  const [recipe, setRecipe] = useState<HomeRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchJson<RecipesResponse>('/api/recipes?sort=latest&limit=1')
      .then((data) => {
        if (!ignore) setRecipe(data.data?.recipes[0] ?? null);
      })
      .catch(() => {
        if (!ignore) setRecipe(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { recipe, isLoading };
}

export function useRecipeCategories() {
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetchJson<CategoriesResponse>('/api/recipe-categories')
      .then((data) => {
        if (!ignore) setCategories(data.data ?? []);
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { categories, isLoading };
}

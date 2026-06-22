import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcRating } from '@/lib/utils';

const PAGE_SIZE_DEFAULT = 12;
const PAGE_SIZE_MAX = 50;
const SORT_VALUES = new Set(['popular', 'latest', 'scrap']);

type RawRecipe = {
  recipe_id: number;
  title: string;
  thumbnail: string;
  recipe_category_id: number;
  difficulty: '쉬움' | '보통' | '어려움';
  cooking_time: number;
  servings: number;
  like_count: number | null;
  scrap_count: number | null;
  created_at: string;
  users: { user_id: number; nickname: string }[] | { user_id: number; nickname: string } | null;
  recipe_categories: { name: string }[] | { name: string } | null;
};

function firstJoinValue<T>(value: T[] | T | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
  const sortParam = searchParams.get('sort') ?? 'popular';
  const sort = SORT_VALUES.has(sortParam) ? sortParam : 'popular';
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const categoryId = Number(searchParams.get('recipeCategoryId'));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('recipes')
    .select(
      `recipe_id, title, thumbnail, recipe_category_id, difficulty, cooking_time, servings,
       like_count, scrap_count, created_at,
       users!inner(user_id, nickname),
       recipe_categories!inner(name)`,
      { count: 'exact' },
    )
    .range(from, to);

  if (keyword) query = query.ilike('title', `%${keyword}%`);
  if (Number.isInteger(categoryId) && categoryId > 0) {
    query = query.eq('recipe_category_id', categoryId);
  }

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'scrap') {
    query = query.order('scrap_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const recipes = (data as unknown as RawRecipe[] | null) ?? [];
  const recipeIds = recipes.map((recipe) => recipe.recipe_id);
  const { data: reviewRows } =
    recipeIds.length > 0
      ? await supabaseAdmin.from('reviews').select('recipe_id, rating').in('recipe_id', recipeIds)
      : { data: [] };

  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const review of reviewRows ?? []) {
    if (!review.recipe_id) continue;
    const stat = ratingMap.get(review.recipe_id) ?? { sum: 0, count: 0 };
    stat.sum += review.rating;
    stat.count += 1;
    ratingMap.set(review.recipe_id, stat);
  }

  return NextResponse.json({
    success: true,
    data: {
      recipes: recipes.map((recipe) => {
        const author = firstJoinValue(recipe.users);
        const category = firstJoinValue(recipe.recipe_categories);
        const stat = ratingMap.get(recipe.recipe_id);

        return {
          recipeId: recipe.recipe_id,
          title: recipe.title,
          thumbnail: recipe.thumbnail,
          recipeCategoryId: recipe.recipe_category_id,
          recipeCategoryName: category?.name ?? '',
          difficulty: recipe.difficulty,
          cookingTime: recipe.cooking_time,
          servings: recipe.servings,
          likeCount: recipe.like_count ?? 0,
          scrapCount: recipe.scrap_count ?? 0,
          rating: calcRating(stat?.sum ?? 0, stat?.count ?? 0),
          reviewCount: stat?.count ?? 0,
          createdAt: recipe.created_at,
          author: {
            userId: author?.user_id ?? 0,
            nickname: author?.nickname ?? '',
          },
        };
      }),
      pagination: { page, limit, total: count ?? 0, hasNext: page * limit < (count ?? 0) },
    },
  });
}

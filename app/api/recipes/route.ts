import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcRating } from '@/lib/utils';
import { requireAuth } from '@/lib/serverAuth';
import { validateRecipeFields, validateImageFile } from '@/lib/validators';
import { createRecipe, type CreateRecipeStepInput } from './db';
import { parseIngredientsMeta, type IngredientMeta } from './shared';

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

type StepMeta = {
  order: number;
  title: string;
  description: string;
  tip: string;
  hasImage: boolean;
};

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const formData = await req.formData();

  const title = formData.get('title') as string | null;
  const recipeCategoryId = Number(formData.get('recipeCategoryId'));
  const difficulty = formData.get('difficulty') as string | null;
  const cookingTime = Number(formData.get('cookingTime'));
  const servings = Number(formData.get('servings'));
  const description = (formData.get('description') as string | null) ?? '';
  const thumbnail = formData.get('thumbnail');
  const stepsRaw = formData.get('steps');
  const ingredientsRaw = formData.get('ingredients');

  if (!title || !difficulty || !stepsRaw) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  if (!(thumbnail instanceof File)) {
    return NextResponse.json(
      { success: false, error: '대표 이미지가 필요합니다.' },
      { status: 400 }
    );
  }

  let stepsMeta: StepMeta[];
  let ingredientsMeta: IngredientMeta[];
  try {
    stepsMeta = JSON.parse(stepsRaw as string);
    ingredientsMeta = ingredientsRaw ? JSON.parse(ingredientsRaw as string) : [];
  } catch {
    return NextResponse.json(
      { success: false, error: '요청 형식이 올바르지 않습니다.' },
      { status: 400 }
    );
  }

  if (!Array.isArray(stepsMeta) || stepsMeta.length === 0) {
    return NextResponse.json(
      { success: false, error: '조리 순서를 1개 이상 입력해주세요.' },
      { status: 400 }
    );
  }
  if (stepsMeta.some((step) => !step.description?.trim())) {
    return NextResponse.json(
      { success: false, error: '조리 순서의 설명을 모두 입력해주세요.' },
      { status: 400 }
    );
  }

  const fieldError = validateRecipeFields({
    title,
    recipeCategoryId,
    difficulty,
    cookingTime,
    servings,
    description,
  });
  if (fieldError) {
    return NextResponse.json({ success: false, error: fieldError }, { status: 400 });
  }

  const thumbnailError = validateImageFile(thumbnail);
  if (thumbnailError) {
    return NextResponse.json({ success: false, error: thumbnailError }, { status: 400 });
  }

  const steps: CreateRecipeStepInput[] = [];
  for (const step of stepsMeta) {
    const image = step.hasImage ? formData.get(`stepImage_${step.order}`) : null;
    if (image instanceof File) {
      const imageError = validateImageFile(image);
      if (imageError) {
        return NextResponse.json({ success: false, error: imageError }, { status: 400 });
      }
    }
    steps.push({
      order: step.order,
      title: step.title?.trim() ? step.title.trim() : null,
      description: step.description,
      tip: step.tip?.trim() ? step.tip.trim() : null,
      image: image instanceof File ? image : null,
    });
  }

  const ingredients = parseIngredientsMeta(ingredientsMeta);
  if (ingredients instanceof NextResponse) return ingredients;

  try {
    const { recipeId } = await createRecipe(
      {
        userId: authed.userId,
        title,
        recipeCategoryId,
        difficulty: difficulty as '쉬움' | '보통' | '어려움',
        cookingTime,
        servings,
        description,
      },
      thumbnail,
      steps,
      ingredients
    );

    return NextResponse.json({ success: true, data: { recipeId } }, { status: 201 });
  } catch (err) {
    console.error('레시피 등록 실패:', err);
    const message = err instanceof Error ? err.message : '레시피 등록에 실패했습니다.';
    const isClientError = [
      '존재하지 않는 카테고리입니다.',
      '존재하지 않는 재료가 포함되어 있습니다.',
      '존재하지 않는 상품이 포함되어 있습니다.',
      '상품의 재료 카테고리를 확인할 수 없습니다.',
    ].includes(message);
    return NextResponse.json(
      { success: false, error: message },
      { status: isClientError ? 400 : 500 }
    );
  }
}

import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calcRating } from '@/lib/utils';
import type { RecipeDetail } from '@/app/(main)/recipes/types';

type RawStep = {
  step_order: number;
  description: string;
  image: string | null;
};

type RawIngredient = {
  ingredient_id: number;
  product_id: number | null;
  amount: number;
  unit: string;
  ingredients: { category: string } | { category: string }[] | null;
  products: { product_id: number; price: number } | { product_id: number; price: number }[] | null;
};

type RawRecipe = {
  recipe_id: number;
  title: string;
  thumbnail: string | null;
  description: string | null;
  difficulty: '쉬움' | '보통' | '어려움';
  cooking_time: number;
  servings: number;
  like_count: number | null;
  scrap_count: number | null;
  users:
    | { user_id: number; nickname: string; profile_image: string | null }
    | { user_id: number; nickname: string; profile_image: string | null }[]
    | null;
  recipe_categories:
    | { recipe_category_id: number; name: string }
    | { recipe_category_id: number; name: string }[]
    | null;
  recipe_steps: RawStep[];
  recipe_ingredients: RawIngredient[];
};

function first<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function fetchRecipeDetail(id: number): Promise<RecipeDetail | null> {
  const { data, error } = await supabaseAdmin
    .from('recipes')
    .select(
      `recipe_id, title, thumbnail, description, difficulty, cooking_time, servings,
       like_count, scrap_count,
       users!inner(user_id, nickname, profile_image),
       recipe_categories!inner(recipe_category_id, name),
       recipe_steps(step_order, description, image),
       recipe_ingredients(ingredient_id, product_id, amount, unit,
         ingredients(category),
         products(product_id, price)
       )`,
    )
    .eq('recipe_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  const recipe = data as unknown as RawRecipe;
  const author = first(recipe.users);
  const category = first(recipe.recipe_categories);

  const { data: reviewRows } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('recipe_id', id);

  const ratingSum = (reviewRows ?? []).reduce((sum, r) => sum + r.rating, 0);
  const ratingCount = (reviewRows ?? []).length;

  const ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviewRows ?? []) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) ratingBreakdown[star]++;
  }

  const steps = [...(recipe.recipe_steps ?? [])]
    .sort((a, b) => a.step_order - b.step_order)
    .map((s) => ({ order: s.step_order, description: s.description, image: s.image ?? null }));

  const recipeIngredients = (recipe.recipe_ingredients ?? []).map((ri) => {
    const ingredient = first(ri.ingredients);
    const product = first(ri.products);
    return {
      ingredientId: ri.ingredient_id,
      name: ingredient?.category ?? '',
      unit: ri.unit,
      amount: ri.amount,
      product: product ? { productId: product.product_id, price: product.price } : null,
    };
  });

  return {
    recipeId: recipe.recipe_id,
    title: recipe.title,
    thumbnail: recipe.thumbnail,
    description: recipe.description ?? '',
    recipeCategoryId: category?.recipe_category_id ?? 0,
    recipeCategoryName: category?.name ?? '',
    difficulty: recipe.difficulty,
    cookingTime: recipe.cooking_time,
    servings: recipe.servings,
    likeCount: recipe.like_count ?? 0,
    scrapCount: recipe.scrap_count ?? 0,
    rating: calcRating(ratingSum, ratingCount),
    reviewCount: ratingCount,
    ratingBreakdown,
    isLiked: false,
    isBookmarked: false,
    author: {
      userId: author?.user_id ?? 0,
      nickname: author?.nickname ?? '',
      profileImage: author?.profile_image ?? null,
    },
    steps,
    recipeIngredients,
  };
}

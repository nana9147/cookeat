import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadRecipeImage, deleteRecipeImageFile } from '@/lib/recipeImage';

export type CreateRecipeStepInput = {
  order: number;
  title: string | null;
  description: string;
  tip: string | null;
  image: File | null;
};

export type CreateRecipeIngredientInput = {
  productId: number | null;
  ingredientId: number | null;
  name: string | null;
  amount: number;
  unit: string;
};

export type CreateRecipeInput = {
  userId: number;
  title: string;
  recipeCategoryId: number;
  difficulty: '쉬움' | '보통' | '어려움';
  cookingTime: number;
  servings: number;
  description: string;
};

export async function createRecipe(
  input: CreateRecipeInput,
  thumbnail: File,
  steps: CreateRecipeStepInput[],
  ingredients: CreateRecipeIngredientInput[]
) {
  const { data: categoryRow, error: categoryError } = await supabaseAdmin
    .from('recipe_categories')
    .select('recipe_category_id')
    .eq('recipe_category_id', input.recipeCategoryId)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!categoryRow) {
    throw new Error('존재하지 않는 카테고리입니다.');
  }

  const manualIngredientIds = [
    ...new Set(ingredients.filter((i) => i.productId === null).map((i) => i.ingredientId as number)),
  ];
  if (manualIngredientIds.length > 0) {
    const { data: ingredientRows, error: ingredientError } = await supabaseAdmin
      .from('ingredients')
      .select('ingredient_id')
      .in('ingredient_id', manualIngredientIds);

    if (ingredientError) throw ingredientError;
    if ((ingredientRows ?? []).length !== manualIngredientIds.length) {
      throw new Error('존재하지 않는 재료가 포함되어 있습니다.');
    }
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('recipes')
    .insert({
      user_id: input.userId,
      recipe_category_id: input.recipeCategoryId,
      title: input.title,
      difficulty: input.difficulty,
      cooking_time: input.cookingTime,
      servings: input.servings,
      description: input.description,
      thumbnail: 'pending',
    })
    .select('recipe_id')
    .single();

  if (insertError) throw insertError;

  const recipeId = inserted.recipe_id;
  const uploadedUrls: string[] = [];

  try {
    const thumbnailUrl = await uploadRecipeImage(recipeId, thumbnail, 'thumbnail');
    uploadedUrls.push(thumbnailUrl);

    const { error: updateError } = await supabaseAdmin
      .from('recipes')
      .update({ thumbnail: thumbnailUrl })
      .eq('recipe_id', recipeId);

    if (updateError) throw updateError;

    const stepRows = [];
    for (const step of steps) {
      let imageUrl: string | null = null;
      if (step.image) {
        imageUrl = await uploadRecipeImage(recipeId, step.image, `step-${step.order}`);
        uploadedUrls.push(imageUrl);
      }
      stepRows.push({
        recipe_id: recipeId,
        step_order: step.order,
        title: step.title,
        description: step.description,
        tip: step.tip,
        image: imageUrl,
      });
    }

    const { error: stepsError } = await supabaseAdmin.from('recipe_steps').insert(stepRows);
    if (stepsError) throw stepsError;

    if (ingredients.length > 0) {
      const ingredientRows = await Promise.all(
        ingredients.map(async (ing) => {
          if (ing.productId === null) {
            return {
              recipe_id: recipeId,
              ingredient_id: ing.ingredientId,
              product_id: null,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            };
          }

          const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('category_id')
            .eq('product_id', ing.productId)
            .maybeSingle();
          if (productError) throw productError;
          if (!product || product.category_id === null) {
            throw new Error('존재하지 않는 상품이 포함되어 있습니다.');
          }

          const { data: category, error: categoryLookupError } = await supabaseAdmin
            .from('categories')
            .select('parent_id')
            .eq('category_id', product.category_id)
            .maybeSingle();
          if (categoryLookupError) throw categoryLookupError;
          if (!category || category.parent_id === null) {
            throw new Error('상품의 재료 카테고리를 확인할 수 없습니다.');
          }

          return {
            recipe_id: recipeId,
            ingredient_id: category.parent_id,
            product_id: ing.productId,
            name: null,
            amount: ing.amount,
            unit: ing.unit,
          };
        })
      );

      const { error: ingredientsError } = await supabaseAdmin
        .from('recipe_ingredients')
        .insert(ingredientRows);
      if (ingredientsError) throw ingredientsError;
    }

    return { recipeId };
  } catch (err) {
    await Promise.allSettled(uploadedUrls.map((url) => deleteRecipeImageFile(url)));
    await supabaseAdmin.from('recipes').delete().eq('recipe_id', recipeId);
    throw err;
  }
}

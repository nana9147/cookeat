import { NextResponse } from 'next/server';
import type { CreateRecipeIngredientInput } from './db';

export type IngredientMeta = {
  productId: number | null;
  ingredientId: number | null;
  name: string | null;
  amount: number;
  unit: string;
};

export const MAX_INGREDIENT_NAME_LENGTH = 100;

export function parseIngredientsMeta(
  ingredientsMeta: IngredientMeta[]
): CreateRecipeIngredientInput[] | NextResponse {
  const ingredients: CreateRecipeIngredientInput[] = (ingredientsMeta ?? []).map((ing) => {
    const productId = Number(ing.productId);
    const name = typeof ing.name === 'string' ? ing.name.trim() : '';
    return {
      productId: Number.isInteger(productId) && productId > 0 ? productId : null,
      ingredientId: Number.isInteger(Number(ing.ingredientId)) ? Number(ing.ingredientId) : null,
      name: name ? name : null,
      amount: Number(ing.amount),
      unit: ing.unit,
    };
  });

  if (ingredients.some((ing) => !ing.ingredientId || ing.ingredientId <= 0)) {
    return NextResponse.json(
      { success: false, error: '재료의 대분류를 선택해주세요.' },
      { status: 400 }
    );
  }
  if (ingredients.some((ing) => ing.productId === null && !ing.name)) {
    return NextResponse.json(
      { success: false, error: '상품을 연결하거나 재료명을 입력해주세요.' },
      { status: 400 }
    );
  }
  if (ingredients.some((ing) => (ing.name?.length ?? 0) > MAX_INGREDIENT_NAME_LENGTH)) {
    return NextResponse.json(
      { success: false, error: `재료명은 ${MAX_INGREDIENT_NAME_LENGTH}자를 초과할 수 없습니다.` },
      { status: 400 }
    );
  }
  if (ingredients.some((ing) => !(ing.amount > 0) || !ing.unit?.trim())) {
    return NextResponse.json(
      { success: false, error: '재료의 용량과 단위를 올바르게 입력해주세요.' },
      { status: 400 }
    );
  }

  return ingredients;
}

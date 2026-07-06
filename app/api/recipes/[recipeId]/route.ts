import { NextRequest, NextResponse } from 'next/server';
import { fetchRecipeDetail } from '@/lib/serverRecipes';
import { requireAuth } from '@/lib/serverAuth';
import { validateRecipeFields, validateImageFile } from '@/lib/validators';
import { updateRecipe, type UpdateRecipeStepInput } from '../db';
import { parseIngredientsMeta } from '../shared';

type StepMeta = {
  order: number;
  title: string;
  description: string;
  tip: string;
  hasImage: boolean;
  existingImage: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await params;
  const id = Number(recipeId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ success: false, error: 'Invalid recipeId' }, { status: 400 });
  }

  try {
    const data = await fetchRecipeDetail(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { recipeId } = await params;
  const id = Number(recipeId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ success: false, error: 'Invalid recipeId' }, { status: 400 });
  }

  const formData = await req.formData();

  const title = formData.get('title') as string | null;
  const recipeCategoryId = Number(formData.get('recipeCategoryId'));
  const difficulty = formData.get('difficulty') as string | null;
  const cookingTime = Number(formData.get('cookingTime'));
  const servings = Number(formData.get('servings'));
  const description = (formData.get('description') as string | null) ?? '';
  const thumbnail = formData.get('thumbnail');
  const existingThumbnail = formData.get('existingThumbnail') as string | null;
  const stepsRaw = formData.get('steps');
  const ingredientsRaw = formData.get('ingredients');

  if (!title || !difficulty || !stepsRaw) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  if (thumbnail instanceof File) {
    const thumbnailError = validateImageFile(thumbnail);
    if (thumbnailError) {
      return NextResponse.json({ success: false, error: thumbnailError }, { status: 400 });
    }
  } else if (!existingThumbnail) {
    return NextResponse.json(
      { success: false, error: '대표 이미지가 필요합니다.' },
      { status: 400 }
    );
  }

  let stepsMeta: StepMeta[];
  let ingredientsMeta: Parameters<typeof parseIngredientsMeta>[0];
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

  const steps: UpdateRecipeStepInput[] = [];
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
      existingImage: image instanceof File ? null : (step.existingImage ?? null),
    });
  }

  const ingredients = parseIngredientsMeta(ingredientsMeta);
  if (ingredients instanceof NextResponse) return ingredients;

  try {
    const { recipeId: updatedId } = await updateRecipe(
      id,
      authed.userId,
      {
        userId: authed.userId,
        title,
        recipeCategoryId,
        difficulty: difficulty as '쉬움' | '보통' | '어려움',
        cookingTime,
        servings,
        description,
      },
      thumbnail instanceof File ? thumbnail : null,
      existingThumbnail,
      steps,
      ingredients
    );

    return NextResponse.json({ success: true, data: { recipeId: updatedId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '레시피 수정에 실패했습니다.';
    const isForbidden = message === '본인 레시피만 수정할 수 있습니다.';
    const isClientError = [
      '존재하지 않는 레시피입니다.',
      '존재하지 않는 카테고리입니다.',
      '존재하지 않는 재료가 포함되어 있습니다.',
      '존재하지 않는 상품이 포함되어 있습니다.',
      '상품의 재료 카테고리를 확인할 수 없습니다.',
      '대표 이미지가 필요합니다.',
    ].includes(message);
    return NextResponse.json(
      { success: false, error: message },
      { status: isForbidden ? 403 : isClientError ? 400 : 500 }
    );
  }
}

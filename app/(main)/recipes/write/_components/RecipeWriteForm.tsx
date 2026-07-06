'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { RecipeDetail } from '../../types';
import BasicInfoSection from './BasicInfoSection';
import IngredientsSection from './IngredientsSection';
import StepsSection from './StepsSection';
import FormActions from './FormActions';
import type {
  IngredientFormItem,
  IngredientOption,
  RecipeBasicInfo,
  RecipeCategoryOption,
  StepFormItem,
} from './types';

const initialBasicInfo: RecipeBasicInfo = {
  title: '',
  recipeCategoryId: '',
  cookingTime: '',
  servings: '',
  difficulty: '보통',
  description: '',
  thumbnail: null,
  thumbnailPreview: null,
};

function createStep(): StepFormItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    tip: '',
    image: null,
    imagePreview: null,
  };
}

function createIngredient(): IngredientFormItem {
  return {
    id: crypto.randomUUID(),
    nameQuery: '',
    selectedProduct: null,
    ingredientId: '',
    amount: '',
    unit: '',
  };
}

function basicInfoFromRecipe(recipe: RecipeDetail): RecipeBasicInfo {
  return {
    title: recipe.title,
    recipeCategoryId: String(recipe.recipeCategoryId),
    cookingTime: String(recipe.cookingTime),
    servings: String(recipe.servings),
    difficulty: recipe.difficulty,
    description: recipe.description,
    thumbnail: null,
    thumbnailPreview: recipe.thumbnail,
  };
}

function stepsFromRecipe(recipe: RecipeDetail): StepFormItem[] {
  return recipe.steps.map((step) => ({
    id: crypto.randomUUID(),
    title: step.title ?? '',
    description: step.description,
    tip: step.tip ?? '',
    image: null,
    imagePreview: step.image,
  }));
}

function ingredientsFromRecipe(recipe: RecipeDetail): IngredientFormItem[] {
  return recipe.recipeIngredients.map((ing) => ({
    id: crypto.randomUUID(),
    nameQuery: ing.name,
    selectedProduct: ing.product
      ? { productId: ing.product.productId, name: ing.name, price: ing.product.price, image: '', category: '' }
      : null,
    ingredientId: String(ing.ingredientId),
    amount: String(ing.amount),
    unit: ing.unit,
  }));
}

interface RecipeWriteFormProps {
  recipeId?: number;
  initialRecipe?: RecipeDetail;
}

export default function RecipeWriteForm({ recipeId, initialRecipe }: RecipeWriteFormProps) {
  const isEdit = !!recipeId && !!initialRecipe;
  const router = useRouter();
  const [categories, setCategories] = useState<RecipeCategoryOption[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [basicInfo, setBasicInfo] = useState<RecipeBasicInfo>(
    initialRecipe ? basicInfoFromRecipe(initialRecipe) : initialBasicInfo
  );
  const [ingredients, setIngredients] = useState<IngredientFormItem[]>(
    initialRecipe ? ingredientsFromRecipe(initialRecipe) : []
  );
  const [steps, setSteps] = useState<StepFormItem[]>(
    initialRecipe ? stepsFromRecipe(initialRecipe) : [createStep()]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/recipe-categories').then(({ data }) => setCategories(data.data));
    api.get('/ingredients').then(({ data }) => setIngredientOptions(data.data));
  }, []);

  const handleBasicInfoChange = <K extends keyof RecipeBasicInfo>(
    field: K,
    value: RecipeBasicInfo[K]
  ) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (id: string, patch: Partial<IngredientFormItem>) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleStepChange = (id: string, field: 'title' | 'description' | 'tip', value: string) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, [field]: value } : step)));
  };

  const handleStepImageChange = (id: string, file: File | null, preview: string | null) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, image: file, imagePreview: preview } : step))
    );
  };

  const handleSubmit = async () => {
    if (
      !basicInfo.title.trim() ||
      !basicInfo.recipeCategoryId ||
      !basicInfo.cookingTime ||
      !basicInfo.servings ||
      !basicInfo.description.trim() ||
      !(basicInfo.thumbnail || basicInfo.thumbnailPreview)
    ) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (steps.some((step) => !step.description.trim())) {
      toast.error('모든 조리 순서의 상세 설명을 입력해주세요.');
      return;
    }
    if (
      ingredients.some(
        (ing) =>
          !ing.ingredientId ||
          (!ing.selectedProduct && !ing.nameQuery.trim()) ||
          !ing.amount ||
          !ing.unit.trim()
      )
    ) {
      toast.error('재료마다 대분류 선택, 상품 연결 또는 재료명, 수량, 단위를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', basicInfo.title);
      formData.append('recipeCategoryId', basicInfo.recipeCategoryId);
      formData.append('difficulty', basicInfo.difficulty);
      formData.append('cookingTime', basicInfo.cookingTime);
      formData.append('servings', basicInfo.servings);
      formData.append('description', basicInfo.description);
      if (basicInfo.thumbnail) {
        formData.append('thumbnail', basicInfo.thumbnail);
      } else if (isEdit) {
        formData.append('existingThumbnail', basicInfo.thumbnailPreview ?? '');
      }

      const stepsMeta = steps.map((step, index) => ({
        order: index + 1,
        title: step.title.trim(),
        description: step.description.trim(),
        tip: step.tip.trim(),
        hasImage: !!step.image,
        existingImage: !step.image ? step.imagePreview : null,
      }));
      formData.append('steps', JSON.stringify(stepsMeta));
      steps.forEach((step, index) => {
        if (step.image) formData.append(`stepImage_${index + 1}`, step.image);
      });

      const ingredientsMeta = ingredients.map((ing) => ({
        productId: ing.selectedProduct?.productId ?? null,
        ingredientId: Number(ing.ingredientId),
        name: ing.selectedProduct ? null : ing.nameQuery.trim(),
        amount: Number(ing.amount),
        unit: ing.unit,
      }));
      formData.append('ingredients', JSON.stringify(ingredientsMeta));

      const { data } = isEdit
        ? await api.patch(`/recipes/${recipeId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await api.post('/recipes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
      toast.success(isEdit ? '레시피가 수정되었습니다.' : '레시피가 등록되었습니다.');
      router.push(`/recipes/${data.data.recipeId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '레시피 저장에 실패했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BasicInfoSection data={basicInfo} categories={categories} onChange={handleBasicInfoChange} />
      <IngredientsSection
        items={ingredients}
        categoryOptions={ingredientOptions}
        onAdd={() => setIngredients((prev) => [...prev, createIngredient()])}
        onRemove={(id) => setIngredients((prev) => prev.filter((item) => item.id !== id))}
        onChange={handleIngredientChange}
      />
      <StepsSection
        steps={steps}
        onAdd={() => setSteps((prev) => [...prev, createStep()])}
        onRemove={(id) =>
          setSteps((prev) => (prev.length > 1 ? prev.filter((step) => step.id !== id) : prev))
        }
        onChange={handleStepChange}
        onImageChange={handleStepImageChange}
      />
      <FormActions onSubmit={handleSubmit} submitting={submitting} isEdit={isEdit} />
    </div>
  );
}

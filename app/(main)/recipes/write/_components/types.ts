export interface RecipeCategoryOption {
  recipeCategoryId: number;
  name: string;
}

export interface IngredientOption {
  ingredientId: number;
  name: string;
}

export interface ProductSearchResult {
  productId: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface StepFormItem {
  id: string;
  title: string;
  description: string;
  tip: string;
  image: File | null;
  imagePreview: string | null;
}

export interface IngredientFormItem {
  id: string;
  nameQuery: string;
  selectedProduct: ProductSearchResult | null;
  ingredientId: string;
  amount: string;
  unit: string;
}

export interface RecipeBasicInfo {
  title: string;
  recipeCategoryId: string;
  cookingTime: string;
  servings: string;
  difficulty: '쉬움' | '보통' | '어려움';
  description: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;
}

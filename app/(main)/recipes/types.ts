export interface RecipeCategory {
  recipeCategoryId: number;
  name: string;
  sortOrder: number;
}

export type SortKey = 'popular' | 'latest' | 'scrap';

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'latest' },
  { label: '스크랩순', value: 'scrap' },
];

export interface RecipeListItem {
  recipeId: number;
  title: string;
  thumbnail: string | null;
  recipeCategoryId: number;
  recipeCategoryName: string;
  difficulty: '쉬움' | '보통' | '어려움';
  cookingTime: number;
  servings: number;
  likeCount: number;
  scrapCount: number;
  rating: number;
  reviewCount: number;
  author: { userId: number; nickname: string };
}

export interface RecipeIngredient {
  ingredientId: number;
  name: string;
  unit: string;
  amount: number;
  product: { productId: number; price: number } | null;
}

export interface RecipeStep {
  order: number;
  description: string;
  image: string | null;
}

export interface RecipeDetail {
  recipeId: number;
  title: string;
  thumbnail: string | null;
  description: string;
  recipeCategoryId: number;
  recipeCategoryName: string;
  difficulty: '쉬움' | '보통' | '어려움';
  cookingTime: number;
  servings: number;
  likeCount: number;
  scrapCount: number;
  rating: number;
  reviewCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  isLiked: boolean;
  isBookmarked: boolean;
  author: { userId: number; nickname: string; profileImage: string | null };
  steps: RecipeStep[];
  recipeIngredients: RecipeIngredient[];
}

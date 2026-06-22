export type HomeRecipe = {
  recipeId: number;
  title: string;
  thumbnail: string;
  author: {
    nickname: string;
  };
  rating: number;
  reviewCount: number;
};

export type RecipeCategory = {
  recipeCategoryId: number;
  name: string;
  sortOrder: number;
};

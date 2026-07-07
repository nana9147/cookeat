export type RecipeCategory =
  | '전체'
  | '한식'
  | '양식'
  | '일식'
  | '중식'
  | '식단'
  | '디저트'
  | '샐러드'
  | '간식'
  | '베이킹';

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  '전체', '한식', '양식', '일식', '중식', '식단', '디저트', '샐러드', '간식', '베이킹',
];

export type SortType = '인기순' | '최신순' | '별점순' | '조회수순';
export const SORT_OPTIONS: SortType[] = ['인기순', '최신순', '별점순', '조회수순'];

export interface Recipe {
  id: string;
  title: string;
  category: Exclude<RecipeCategory, '전체'>;
  author: string;
  cookTime: number;
  servings: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  imageUrl?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: string;
  price: number;
}

export interface RecipeStep {
  order: number;
  description: string;
}

export interface RecipeDetail extends Recipe {
  description: string;
  calories: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const MOCK_RECIPES: Recipe[] = [
  { id: '1', title: '크림 버섯 파스타', category: '양식', author: '올리비아', cookTime: 20, servings: 2, rating: 4.8, reviewCount: 130, isNew: true },
  { id: '2', title: '매콤 떡볶이', category: '한식', author: '수제르소', cookTime: 30, servings: 4, rating: 4.7, reviewCount: 86 },
  { id: '3', title: '김치찌개', category: '한식', author: '이재민공주', cookTime: 40, servings: 4, rating: 4.4, reviewCount: 74 },
  { id: '4', title: '수비드 닭가슴살 샐러드', category: '샐러드', author: '플로비아', cookTime: 30, servings: 2, rating: 4.9, reviewCount: 93, isNew: true },
  { id: '5', title: '초코 티라미수', category: '디저트', author: '심플래이모스', cookTime: 60, servings: 6, rating: 4.8, reviewCount: 71 },
  { id: '6', title: '나물 듬뿍 비빔밥', category: '한식', author: '심플래이', cookTime: 35, servings: 2, rating: 4.8, reviewCount: 56 },
  { id: '7', title: '된장찌개', category: '한식', author: '쿡마이', cookTime: 25, servings: 4, rating: 4.7, reviewCount: 71 },
  { id: '8', title: '마파두부', category: '중식', author: '플로비아', cookTime: 20, servings: 3, rating: 4.5, reviewCount: 54 },
  { id: '9', title: '연어 밥', category: '일식', author: '소서이', cookTime: 20, servings: 2, rating: 4.8, reviewCount: 415 },
  { id: '10', title: '갈릭 스테이크', category: '양식', author: '스테이크하우스', cookTime: 30, servings: 2, rating: 4.8, reviewCount: 507 },
  { id: '11', title: '치즈 감자전', category: '간식', author: '간식바', cookTime: 25, servings: 3, rating: 4.6, reviewCount: 43 },
  { id: '12', title: '홈베이드 스콘', category: '베이킹', author: '홈베이이', cookTime: 45, servings: 8, rating: 4.7, reviewCount: 63 },
];

export const MOCK_RECIPE_DETAILS: Record<string, RecipeDetail> = {
  '1': {
    id: '1',
    title: '크림 버섯 파스타',
    category: '양식',
    author: '올리비아',
    cookTime: 20,
    servings: 2,
    rating: 4.8,
    reviewCount: 130,
    isNew: true,
    description:
      '진한 크림 소스와 향긋한 버섯이 어우러진 파스타입니다. 집에서도 레스토랑 맛을 낼 수 있어요. 30분 이내로 완성할 수 있어 바쁜 날에도 간단하게 즐길 수 있습니다.',
    calories: 580,
    ingredients: [
      { id: 'i1', name: '스파게티면', amount: '200g', price: 2490 },
      { id: 'i2', name: '양송이버섯', amount: '150g', price: 3200 },
      { id: 'i3', name: '생크림', amount: '200ml', price: 4000 },
      { id: 'i4', name: '베이컨', amount: '100g', price: 2800 },
      { id: 'i5', name: '파마산 치즈', amount: '30g', price: 1490 },
      { id: 'i6', name: '마늘', amount: '4쪽', price: 980 },
    ],
    steps: [
      { order: 1, description: '물을 끓이고 소금을 넣은 후 스파게티면을 알덴테로 삶습니다. 면수는 1컵 정도 남겨두세요.' },
      { order: 2, description: '버섯은 적당한 크기로 잘라주세요. 베이컨도 먹기 좋게 잘라 기름 없이 팬에 바삭하게 볶아냅니다.' },
      { order: 3, description: '버섯 볶기: 올리브오일을 두르고 마늘을 볶다가 버섯을 넣어 노릇하게 볶습니다.' },
      { order: 4, description: '생크림 소스: 크림을 넣고 중불에서 걸쭉해질 때까지 저어가며 끓입니다.' },
      { order: 5, description: '삶은 면을 넣어 소스와 잘 버무리고, 면수로 농도를 조절합니다. 파마산 치즈를 뿌려 완성하세요.' },
    ],
    ratingBreakdown: { 5: 100, 4: 21, 3: 5, 2: 3, 1: 1 },
  },
};

export type CartItem = {
  id: number;
  name: string;
  origin: string;
  tags: string[];
  price: number;
  qty: number;
  checked: boolean;
  badgeDiscount?: string;
};

export type RecipeGroup = {
  id: string;
  recipeName: string;
  servings: number;
  seller: string;
  discountCount: number;
  discountAmount: number;
  total: number;
  items: CartItem[];
};

export const RECIPE_GROUPS: RecipeGroup[] = [
  {
    id: 'cream-pasta',
    recipeName: '크림 버섯 파스타',
    servings: 2,
    seller: '마카 판매자',
    discountCount: 6,
    discountAmount: 1300,
    total: 17350,
    items: [
      { id: 1, name: '스파게티 면 500g', origin: '이탈리아산 · 무 · 쿠킨직영', tags: ['세벽배송'], price: 2490, qty: 1, checked: true },
      { id: 2, name: '친란경 양송이버섯 200g', origin: '국내산 · 신산마켓', tags: ['세벽배송'], price: 2980, qty: 1, checked: true },
      { id: 3, name: '유기농 생크림 200ml', origin: '국내산 · 유기농 · 농장직송', tags: ['세벽배송'], price: 3200, qty: 1, checked: true },
      { id: 4, name: '파마산 치즈가루 50g', origin: '이탈리아산 · 치즈마켓', tags: ['세벽배송'], price: 4500, qty: 1, checked: true },
      { id: 5, name: '깐 마늘 100g', origin: '국내산 · 쿠킨직영', tags: ['세벽배송'], price: 1200, qty: 1, checked: true },
      { id: 6, name: '햇양파 1.5kg', origin: '국내산 · 무관 · 신선마켓', tags: ['세벽배송'], price: 2980, qty: 1, checked: true, badgeDiscount: '30% 할인' },
    ],
  },
  {
    id: 'kimchi-jjigae',
    recipeName: '김치찌개',
    servings: 2,
    seller: '마카 판매자',
    discountCount: 3,
    discountAmount: 220,
    total: 14600,
    items: [
      { id: 7, name: '포기김치 종가집 500g', origin: '국내산 · 종가 · 종가김마켓', tags: ['세벽배송', 'BEST'], price: 4500, qty: 1, checked: true },
      { id: 8, name: '돼지고기 앞다리 600g', origin: '국내산 · 한돈 · 친환경마켓', tags: ['세벽배송'], price: 8900, qty: 1, checked: true },
      { id: 9, name: '국산콩 두부 (찌개용) 1모', origin: '국내산 · 쿠킨직영', tags: ['세벽배송'], price: 1200, qty: 1, checked: true, badgeDiscount: '15% 할인' },
    ],
  },
];

export const INDIVIDUAL_ITEMS: CartItem[] = [
  { id: 10, name: '동물복지 달걀 10구', origin: '국내산 · 유정란 · 농장직송', tags: ['세벽배송', 'NEW'], price: 7980, qty: 2, checked: true },
  { id: 11, name: '생연이 슬라이스 200g', origin: '무농약', tags: [], price: 12900, qty: 1, checked: false },
];

import { Review } from '@/components/common/ReviewSection';

export const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    authorName: '소미채식주의자',
    rating: 5,
    content: '싱싱하고 달달한 양파에요. 볶음 요리에 쓰니 맛이 훨씬 좋아졌어요.',
    createdAt: '2026.05.12',
  },
  {
    id: '2',
    authorName: '김주부',
    rating: 4,
    content: '배송도 빠르고 신선해요. 다음에도 구매할 것 같아요.',
    createdAt: '2026.05.08',
  },
];

export const MOCK_RATING_BREAKDOWN: Record<1 | 2 | 3 | 4 | 5, number> = {
  5: 124,
  4: 67,
  3: 22,
  2: 8,
  1: 4,
};

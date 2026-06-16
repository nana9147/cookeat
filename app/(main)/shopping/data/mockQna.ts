export interface Qna {
  id: string;
  author: string;
  question: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

export const MOCK_QNA: Qna[] = [
  {
    id: '1',
    author: '김*주',
    question: '이 양파 당도가 높은 편인가요? 샐러드용으로 쓰려고 하는데 맵지 않았으면 해서요.',
    createdAt: '2026.06.10',
    answer:
      '안녕하세요! 무안 햇양파는 수분이 많고 단맛이 강해 샐러드나 생으로 드시기에 적합합니다. 매운맛이 적어 많은 분들이 만족하고 계세요.',
    answeredAt: '2026.06.11',
  },
  {
    id: '2',
    author: '이*연',
    question: '2박스 이상 주문하면 할인이 되나요?',
    createdAt: '2026.06.12',
    answer:
      '현재 대량 구매 할인은 별도 운영하고 있지 않으나, 3만원 이상 구매 시 무료배송 혜택이 적용됩니다.',
    answeredAt: '2026.06.13',
  },
  {
    id: '3',
    author: '박*현',
    question: '산지 직송이면 보통 수확 후 며칠 이내에 배송되나요?',
    createdAt: '2026.06.14',
  },
];

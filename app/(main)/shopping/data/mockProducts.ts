import { ShoppingProduct } from '@/types/ingredient';

export const mockProducts: ShoppingProduct[] = [
  // 채소
  { id: '1', name: '양파 1.5kg', category: '채소', price: 4260, discountRate: 30, rating: 4.5, reviewCount: 234, seller: '그린팜', stock: 100 },
  { id: '2', name: '시금치 1단 600g', category: '채소', price: 8900, rating: 4.3, reviewCount: 89, seller: '유기농마켓', stock: 50 },
  { id: '3', name: '대파 1단 (700g)', category: '채소', price: 1500, rating: 4.7, reviewCount: 412, seller: '신선채소', isNew: true, stock: 200 },
  { id: '4', name: '동물복지달걀 10구', category: '정육·계란', price: 3900, rating: 4.8, reviewCount: 891, seller: '행복한닭', stock: 500, volume: '10구' },
  { id: '5', name: '브로콜리 300g', category: '채소', price: 3200, discountRate: 15, rating: 4.6, reviewCount: 178, seller: '그린팜', isNew: true, stock: 80 },
  { id: '6', name: '당근 500g', category: '채소', price: 1900, rating: 4.4, reviewCount: 99, seller: '신선채소', stock: 150 },
  { id: '7', name: '파프리카 3개입', category: '채소', price: 4200, discountRate: 10, rating: 4.5, reviewCount: 67, seller: '유기농마켓', stock: 60 },
  { id: '8', name: '감자 2kg', category: '채소', price: 5900, rating: 4.3, reviewCount: 145, seller: '그린팜', stock: 200 },

  // 과일·견과
  { id: '9', name: '제주 감귤 3kg', category: '과일·견과', price: 15900, discountRate: 20, rating: 4.9, reviewCount: 568, seller: '제주팜', stock: 150 },
  { id: '10', name: '국산 호두 200g', category: '과일·견과', price: 9800, rating: 4.6, reviewCount: 112, seller: '견과왕', isNew: true, stock: 200 },
  { id: '11', name: '블루베리 180g', category: '과일·견과', price: 8200, discountRate: 15, rating: 4.7, reviewCount: 324, seller: '베리팜', stock: 40 },
  { id: '12', name: '바나나 1.2kg', category: '과일·견과', price: 2500, rating: 4.4, reviewCount: 201, seller: '제주팜', stock: 300 },

  // 정육·계란
  { id: '13', name: '국산 삼겹살 500g', category: '정육·계란', price: 18900, discountRate: 10, rating: 4.5, reviewCount: 267, seller: '정육왕', stock: 80 },
  { id: '14', name: '닭가슴살 1kg', category: '정육·계란', price: 8900, rating: 4.6, reviewCount: 145, seller: '신선육', isNew: true, stock: 100 },
  { id: '15', name: '소고기 불고기감 300g', category: '정육·계란', price: 24900, discountRate: 5, rating: 4.8, reviewCount: 432, seller: '정육왕', stock: 60 },
  { id: '16', name: '훈제 오리 200g', category: '정육·계란', price: 9900, rating: 4.3, reviewCount: 88, seller: '신선육', stock: 120 },

  // 수산·해산물
  { id: '17', name: '생연어 슬라이스 200g', category: '수산·해산물', price: 14900, discountRate: 20, rating: 4.7, reviewCount: 432, seller: '노르웨이피쉬', stock: 60 },
  { id: '18', name: '새우 (냉동) 300g', category: '수산·해산물', price: 8900, discountRate: 15, rating: 4.6, reviewCount: 201, seller: '바다선물', isNew: true, stock: 120 },
  { id: '19', name: '고등어 2마리', category: '수산·해산물', price: 5900, rating: 4.4, reviewCount: 167, seller: '바다선물', stock: 80 },
  { id: '20', name: '홍합 500g', category: '수산·해산물', price: 4800, rating: 4.2, reviewCount: 54, seller: '노르웨이피쉬', stock: 40 },

  // 쌀·잡곡
  { id: '21', name: '국산 현미 2kg', category: '쌀·잡곡', price: 11900, rating: 4.8, reviewCount: 345, seller: '쌀나라', stock: 200 },
  { id: '22', name: '퀴노아 200g', category: '쌀·잡곡', price: 8500, discountRate: 15, rating: 4.5, reviewCount: 112, seller: '건강잡곡', isNew: true, stock: 150 },
  { id: '23', name: '오트밀 500g', category: '쌀·잡곡', price: 4500, discountRate: 10, rating: 4.6, reviewCount: 89, seller: '건강잡곡', stock: 300 },

  // 유제품
  { id: '24', name: '요거트 우유 900ml', category: '유제품', price: 4125, discountRate: 20, rating: 4.7, reviewCount: 523, seller: '데어리팜', stock: 150 },
  { id: '25', name: '스트링치즈 5개입', category: '유제품', price: 4900, rating: 4.6, reviewCount: 287, seller: '치즈공방', isNew: true, stock: 200 },
  { id: '26', name: '그릭 요거트 200g', category: '유제품', price: 3200, discountRate: 5, rating: 4.8, reviewCount: 412, seller: '데어리팜', stock: 80 },
  { id: '27', name: '우유 1L', category: '유제품', price: 2800, rating: 4.5, reviewCount: 634, seller: '치즈공방', stock: 500 },

  // 오일/소스
  { id: '28', name: '올리브 오일 500ml', category: '오일/소스', price: 18900, discountRate: 25, rating: 4.9, reviewCount: 678, seller: '오일하우스', stock: 100 },
  { id: '29', name: '국산 참기름 180ml', category: '오일/소스', price: 9900, rating: 4.6, reviewCount: 234, seller: '전통소스', isNew: true, stock: 200 },
  { id: '30', name: '굴소스 300g', category: '오일/소스', price: 4500, discountRate: 10, rating: 4.4, reviewCount: 156, seller: '전통소스', stock: 300 },

  // 밀키트
  { id: '31', name: '순두부찌개 밀키트 2인분', category: '밀키트', price: 9800, isNew: true, rating: 4.7, reviewCount: 156, seller: '쿡잇', stock: 50 },
  { id: '32', name: '된장찌개 밀키트 2인분', category: '밀키트', price: 10470, discountRate: 15, rating: 4.5, reviewCount: 89, seller: '쿡잇', stock: 120 },
  { id: '33', name: '떡볶이 밀키트 2인분', category: '밀키트', price: 7900, discountRate: 20, rating: 4.8, reviewCount: 312, seller: '밀키트왕', stock: 80 },
  { id: '34', name: '부대찌개 밀키트 3인분', category: '밀키트', price: 14900, rating: 4.6, reviewCount: 198, seller: '밀키트왕', isNew: true, stock: 60 },
];

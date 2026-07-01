// ─── 상품 ───────────────────────────────────────────────────────────────────
export type AdminProductStatus = '판매중' | '품절' | '숨김';

export interface AdminProduct {
  productId: number;
  name: string;
  sellerName: string;
  categoryId: number | null;
  categoryName: string | null;
  parentId: number | null;
  price: number;
  stock: number;
  status: AdminProductStatus;
}

// ─── 회원 ───────────────────────────────────────────────────────────────────
export type AdminMemberGrade = '일반' | 'VIP';
export type AdminMemberStatus = 'active' | 'suspended';

export interface AdminMember {
  userId: number;
  email: string;
  nickname: string;
  createdAt: string;
  grade: AdminMemberGrade;
  orderCount: number;
  status: AdminMemberStatus;
  point: number;
}

// ─── 주문 ───────────────────────────────────────────────────────────────────
export type AdminOrderStatus =
  | '결제전'
  | '결제완료'
  | '주문확인'
  | '배송준비'
  | '배송중'
  | '배송완료'
  | '구매확정'
  | '취소'
  | '환불';

export interface AdminOrderItem {
  itemId: number;
  orderId: string;
  productId: number;
  productName: string;
  sellerId: number;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  orderId: string;
  userId: number;
  totalAmount: number;
  shippingFee: number;
  usedPoint: number;
  couponId: number | null;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  status: AdminOrderStatus;
  recipient: string;
  phone: string;
  address: string;
  addressDetail: string;
  shippingRequest: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: AdminOrderItem[];
}

// ─── 판매자 ─────────────────────────────────────────────────────────────────
export type AdminSellerStatus = '승인' | '대기' | '거절' | '정지';

export interface AdminApiSeller {
  sellerId: number;
  storeName: string;
  businessNumber: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
  commissionRate: number;
  representativeName: string;
  csPhone: string;
  status: AdminSellerStatus;
  productCount: number;
  rating: number | null;
  createdAt: string;
}

// ─── 리뷰·신고 ──────────────────────────────────────────────────────────────
export interface AdminReport {
  reporter: string;
  date: string;
  reason: string;
}

export type AdminReviewState = '정상' | '신고';

export interface AdminReview {
  id: number;
  productName: string;
  author: string;
  email: string;
  rating: number;
  date: string;
  reportCount: number;
  state: AdminReviewState;
  content: string;
  reports: AdminReport[];
}

export interface AdminReviewStats {
  total: number;
  pendingReports: number;
}

// ─── 정산 ───────────────────────────────────────────────────────────────────
export type AdminSettlementRawStatus = '대기' | '완료';

export interface AdminSettlement {
  settlementId: number;
  sellerId: number;
  storeName: string;
  bankName: string;
  bankAccount: string;
  commissionRate: number;
  amount: number;
  fee: number;
  status: AdminSettlementRawStatus;
  periodStart: string;
  periodEnd: string;
  settledAt: string | null;
  createdAt: string;
}

export interface AdminSettlementStats {
  pendingCount: number;
  pendingAmount: number;
  completedCount: number;
  completedAmount: number;
  totalFee: number;
}

// ─── 쿠폰 ───────────────────────────────────────────────────────────────────
export type AdminCouponDiscountType = 'rate' | 'fixed';

export interface AdminCoupon {
  couponId: number;
  code: string;
  discountType: AdminCouponDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  issuedCount: number;
  usedCount: number;
  expiredAt: string;
  createdAt: string;
}

// ─── 레시피·포인트 ───────────────────────────────────────────────────────────
export interface AdminRecipe {
  recipeId: number;
  title: string;
  author: string;
  authorEmail: string;
  category: string;
  difficulty: '쉬움' | '보통' | '어려움';
  cookingTime: number;
  likeCount: number;
  scrapCount: number;
  createdAt: string;
}

export interface AdminPointStats {
  totalEarned: number;
  totalUsed: number;
  netOutstanding: number;
  totalRecipes: number;
  referralOrderCount: number;
  totalReferralPoints: number;
}

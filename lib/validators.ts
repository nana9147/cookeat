// 서버·클라이언트 어디서든 재사용할 수 있는 입력 검증 모음
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^010-\d{4}-\d{4}$/;

const ALLOWED_PRODUCT_STATUSES = ['판매중', '품절', '판매종료', '숨김'];
const ALLOWED_DISCOUNT_TYPES = ['none', 'rate', 'amount'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_DIFFICULTIES = ['쉬움', '보통', '어려움'];

export function validateProductFields(input: {
  status: string;
  price: number;
  stock: number;
  discountType: string;
  discountValue: number | null;
}): string | null {
  if (!ALLOWED_PRODUCT_STATUSES.includes(input.status)) return '유효하지 않은 상태값입니다.';
  if (input.price <= 0) return '가격은 0보다 커야 합니다.';
  if (input.stock < 0) return '재고는 0 이상이어야 합니다.';
  if (!ALLOWED_DISCOUNT_TYPES.includes(input.discountType)) return '유효하지 않은 할인 유형입니다.';
  if (input.discountType === 'rate') {
    if (input.discountValue === null || input.discountValue < 0 || input.discountValue > 100) {
      return '할인율은 0~100 사이여야 합니다.';
    }
  }
  return null;
}

export function validateRecipeFields(input: {
  title: string;
  recipeCategoryId: number;
  difficulty: string;
  cookingTime: number;
  servings: number;
  description: string;
}): string | null {
  if (!input.title.trim()) return '레시피 제목을 입력해주세요.';
  if (!Number.isInteger(input.recipeCategoryId) || input.recipeCategoryId <= 0)
    return '카테고리를 선택해주세요.';
  if (!ALLOWED_DIFFICULTIES.includes(input.difficulty)) return '유효하지 않은 난이도입니다.';
  if (!Number.isInteger(input.cookingTime) || input.cookingTime <= 0)
    return '조리 시간을 올바르게 입력해주세요.';
  if (!Number.isInteger(input.servings) || input.servings <= 0)
    return '인분 수를 올바르게 입력해주세요.';
  if (!input.description.trim()) return '레시피 설명을 입력해주세요.';
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return '이미지는 JPG, PNG, WEBP 형식만 허용됩니다.';
  if (file.size > MAX_IMAGE_SIZE) return '이미지 크기는 5MB를 초과할 수 없습니다.';
  return null;
}

export function validateSignup(input: {
  email?: string;
  password?: string;
  nickname?: string;
  phone?: string;
}): string | null {
  if (!input.email || !EMAIL_RE.test(input.email)) return '이메일 형식이 올바르지 않습니다.';
  if (!input.password || input.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  if (!input.nickname?.trim()) return '닉네임을 입력해주세요.';
  if (!input.phone || !PHONE_RE.test(input.phone))
    return '전화번호 형식(010-0000-0000)이 올바르지 않습니다.';
  return null; // null이면 통과
}

export function validatePhone(phone: string): boolean {
  return PHONE_RE.test(phone);
}

export function validateLogin(input: { email?: string; password?: string }): string | null {
  if (!input.email || !EMAIL_RE.test(input.email)) return '이메일 형식이 올바르지 않습니다.';
  if (!input.password) return '비밀번호를 입력해주세요.';
  return null;
}

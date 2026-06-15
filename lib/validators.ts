// 서버·클라이언트 어디서든 재사용할 수 있는 입력 검증 모음
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^010-\d{4}-\d{4}$/;

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

export function validateLogin(input: { email?: string; password?: string }): string | null {
  if (!input.email || !EMAIL_RE.test(input.email)) return '이메일 형식이 올바르지 않습니다.';
  if (!input.password) return '비밀번호를 입력해주세요.';
  return null;
}

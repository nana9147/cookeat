const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;

export type PasswordStrength = 'danger' | 'normal' | 'strong' | 'very-strong';

export const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { label: string; segments: number; color: string; textColor: string }
> = {
  danger: { label: '위험', segments: 1, color: 'bg-red', textColor: 'text-red' },
  normal: { label: '보통', segments: 2, color: 'bg-yellow', textColor: 'text-yellow' },
  strong: { label: '강함', segments: 3, color: 'bg-primary', textColor: 'text-primary' },
  'very-strong': { label: '매우 강함', segments: 4, color: 'bg-primary', textColor: 'text-primary' },
};

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  if (password.length < 8) return 'danger';
  const hasLetter = HAS_LETTER.test(password);
  const hasNumber = HAS_NUMBER.test(password);
  const hasSpecial = SPECIAL.test(password);
  if (hasLetter && hasNumber && hasSpecial && password.length >= 10) return 'very-strong';
  if (hasLetter && hasNumber && hasSpecial) return 'strong';
  if (hasLetter && hasNumber) return 'normal';
  return 'danger';
}

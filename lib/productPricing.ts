export function resolveDiscountValue(
  discountType: string,
  discountValueRaw: string | null
): number | null {
  if (discountType === 'none') return null;
  if (!discountValueRaw) return null;
  return Number(discountValueRaw);
}

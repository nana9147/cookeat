export function resolveDiscountValue(
  discountType: string,
  discountValueRaw: string | null
): number | null {
  if (discountType === 'none') return null;
  if (!discountValueRaw) return null;
  return Number(discountValueRaw);
}

export function calcDiscountedPrice(
  price: number,
  discountType: string | null,
  discountValue: number | null,
  quantity: number = 1
): number {
  if (!discountType || discountType === 'none' || !discountValue) {
    return price * quantity;
  }

  let singleDiscountedPrice = price;

  if (discountType === 'amount' || discountType === 'fixed') {
    singleDiscountedPrice = Math.max(0, price - discountValue);
  } else if (discountType === 'rate') {
    singleDiscountedPrice = Math.max(0, Math.floor(price * (1 - discountValue / 100)));
  }

  return singleDiscountedPrice * quantity;
}

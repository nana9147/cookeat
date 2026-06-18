export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_FEE = 3000;

export function calcShipping(totalAmount: number): number {
  return totalAmount > 0 && totalAmount < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
}

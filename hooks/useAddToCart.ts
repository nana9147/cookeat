'use client';

import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

export function useAddToCart() {
  const addItems = useCartStore((s) => s.addItems);
  return (productId: number, quantity: number) => {
    addItems([{ productId, quantity }]);
    toast.success('장바구니에 담았습니다.');
  };
}

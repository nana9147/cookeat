'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import type { CartProduct } from '@/store/cartStore';
import api from '@/lib/api';
import { calcShipping } from '@/lib/shipping';

export type MergedCartItem = {
  productId: number;
  quantity: number;
  recipeId?: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  origin: string;
  seller: string;
  available: boolean;
};

export function useCartItems() {
  const { items, cachedProducts, cachedProductsKey, setCachedProducts, updateQuantity, removeItem, removeItems } =
    useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const idsKey = [...items.map((i) => i.productId)].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!idsKey || idsKey === cachedProductsKey) return;

    let cancelled = false;

    const fetchItems = () => {
      setLoading(true);
      setError(false);
      api
        .get<{ items: CartProduct[] }>(`/cart?ids=${idsKey}`)
        .then(({ data }) => { if (!cancelled) setCachedProducts(idsKey, data.items); })
        .catch(() => {
          if (!cancelled) setError(true);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchItems();

    return () => { cancelled = true; };
  }, [idsKey, cachedProductsKey, setCachedProducts]);

  const merged = items
    .map((item) => {
      const p = cachedProducts.find((p) => p.product_id === item.productId);
      if (!p) return null;
      return {
        productId: item.productId,
        quantity: item.quantity,
        recipeId: item.recipeId,
        name: p.name,
        price: p.price,
        image: p.image,
        stock: p.stock,
        origin: p.origin,
        seller: p.sellers?.store_name ?? '',
        available: p.status === '판매중' && p.stock > 0,
      } satisfies MergedCartItem;
    })
    .filter(Boolean) as MergedCartItem[];

  const totalAmount = merged
    .filter((i) => i.available)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = calcShipping(totalAmount);
  const finalAmount = totalAmount + shippingFee;

  return {
    items: merged,
    storeItems: items,
    loading,
    error,
    totalAmount,
    shippingFee,
    finalAmount,
    updateQuantity,
    removeItem,
    removeItems,
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartStoreItem = {
  productId: number;
  quantity: number;
  recipeId?: number;
};

export type CartProduct = {
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  origin: string;
  status: string;
  sellers: { store_name: string } | null;
};

type CartStore = {
  items: CartStoreItem[];
  cachedProducts: CartProduct[];
  cachedProductsKey: string;
  checkoutItems: CartStoreItem[];
  addItems: (newItems: CartStoreItem[]) => void;
  removeItem: (productId: number) => void;
  removeItems: (productIds: number[]) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  setCachedProducts: (key: string, products: CartProduct[]) => void;
  setCheckoutItems: (items: CartStoreItem[]) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      cachedProducts: [],
      cachedProductsKey: '',
      checkoutItems: [],
      addItems: (newItems) =>
        set((state) => {
          const updated = [...state.items];
          for (const item of newItems) {
            const idx = updated.findIndex((i) => i.productId === item.productId);
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
            } else {
              updated.push(item);
            }
          }
          return { items: updated };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      removeItems: (productIds) =>
        set((state) => ({ items: state.items.filter((i) => !productIds.includes(i.productId)) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [], cachedProducts: [], cachedProductsKey: '', checkoutItems: [] }),
      setCachedProducts: (key, products) => set({ cachedProducts: products, cachedProductsKey: key }),
      setCheckoutItems: (items) => set({ checkoutItems: items }),
    }),
    {
      name: 'cookeat-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

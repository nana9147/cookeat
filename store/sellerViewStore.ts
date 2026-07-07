import { create } from 'zustand';

interface SellerViewState {
  viewAsSellerId: number | null;
  setViewAsSellerId: (id: number | null) => void;
}

export const useSellerViewStore = create<SellerViewState>()((set) => ({
  viewAsSellerId: null,
  setViewAsSellerId: (id) => set({ viewAsSellerId: id }),
}));

export interface ProductOption {
  label: string;
  price: number;
}

export interface ProductPurchasePanelProps {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  qnaCount?: number;
  price: number;
  discountRate?: number;
  shippingInfo?: string;
  details?: { label: string; value: string }[];
  options?: ProductOption[];
  stock: number;
  onAddToCart?: (optionLabel: string, qty: number) => void;
}

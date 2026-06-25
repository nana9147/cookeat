export type PreviewItem = {
  itemId: number;
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  orderId: string;
  finalAmount: number;
  totalAmount: number;
  shippingFee: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
  previewItems: PreviewItem[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
};

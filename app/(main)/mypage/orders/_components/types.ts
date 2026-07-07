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
  hasPendingCancelRequest: boolean;
  hasPendingRefundRequest: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
};

export type OrderDetail = {
  orderId: string;
  status: string;
  hasPendingCancelRequest: boolean;
  hasPendingRefundRequest: boolean;
  createdAt: string;
  totalAmount: number;
  shippingFee: number;
  usedPoint: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  shipping: {
    recipient: string;
    phone: string;
    address: string;
    addressDetail: string | null;
    request: string | null;
  };
  items: {
    itemId: number;
    productId: number;
    name: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
    claim: {
      status: string;
      requestReason: string | null;
      rejectReason: string | null;
    } | null;
  }[];
  trackings: {
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  }[];
};

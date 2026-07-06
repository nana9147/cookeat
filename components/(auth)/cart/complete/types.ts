export type OrderDetail = {
  orderId: string;
  totalAmount: number;
  shippingFee: number;
  usedPoint: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  recipient: string;
  phone: string;
  address: string;
  createdAt: string;
  items: {
    itemId: number;
    name: string;
    image: string | null;
    seller: string;
    quantity: number;
    unitPrice: number;
  }[];
};

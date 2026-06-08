// types/seller/shipping.ts
export interface AddressItem {
  id: string;
  name: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
}

export type ShippingFeeType = 'free' | 'paid' | 'conditional';

export interface ShippingFeeItem {
  id: string;
  name: string;
  type: ShippingFeeType;
  fee: number;
  freeThreshold?: number; //조건부 무배 기준 금액
}

export interface ShippingSectionProps {
  deliveryMethod: string;
  shippingFee: string;
  returnFee: string;
  originAddress: string;
  returnAddress: string;
  onDeliveryMethodChange: (value: string) => void;
  onShippingFeeChange: (value: string) => void;
  onReturnFeeChange: (value: string) => void;
  onOriginAddressChange: (value: string) => void;
  onReturnAddressChange: (value: string) => void;
}

export type ShippingFeeType = '무료' | '유료' | '조건부 무료';

export type CourierCode =
  | 'CJ대한통운'
  | '로젠택배'
  | '한진택배'
  | '롯데택배'
  | '우체국택배'
  | 'CU 편의점택배'
  | 'GS25 편의점택배'
  | 'ETC'; // types/seller/shipping.ts

export interface AddressItem {
  id: string;
  name: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
}

export interface ShippingFeeItem {
  id: string;
  name: string;
  type: ShippingFeeType;
  fee: number;
  freeThreshold?: number; //조건부 무배 기준 금액
}

export interface ShippingData {
  shippingFeeType: ShippingFeeType;
  shippingFee: string;
  freeThreshold: string;
  returnFee: string;
  originAddress: string;
  returnAddress: string;
}
export interface ShippingSectionProps {
  data: ShippingData;
  onChange: (field: keyof ShippingData, value: string) => void;
}

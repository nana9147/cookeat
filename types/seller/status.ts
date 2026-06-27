import { OrderStatus } from './order';
import { ProductStatus } from './product';
import { SettlementStatus } from './settlement';
import { AddressBadgeType, ShippingFeeType } from './shipping';
import { ApproveStatus } from './seller';

export type RefundDisplayStatus = '환불요청' | '환불반려' | '취소요청' | '취소반려';

export type BadgeStatus =
  | ProductStatus
  | OrderStatus
  | AddressBadgeType
  | ShippingFeeType
  | SettlementStatus
  | ApproveStatus
  | RefundDisplayStatus;

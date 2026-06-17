import { OrderStatus } from './order';
import { ProductStatus } from './product';
import { SettlementStatus } from './settlement';
import { AddressBadgeType, ShippingFeeType } from './shipping';
import { ApproveStatus } from './seller';

export type BadgeStatus =
  | ProductStatus
  | OrderStatus
  | AddressBadgeType
  | ShippingFeeType
  | SettlementStatus
  | ApproveStatus;

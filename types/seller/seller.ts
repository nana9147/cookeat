import { LucideIcon } from 'lucide-react';

export interface StateCard {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: LucideIcon;
}

export type ApproveStatus = 'pending' | 'approved' | 'rejected';

export interface SellerApplication {
  seller_id: number;
  store_name: string;
  business_number: string;
  business_address: string | null;
  bank_name: string;
  bank_account: string;
  approve_status: ApproveStatus;
  rejected_reason: string | null;
  created_at: string;
}

export interface SellerApplicationProps {
  data: SellerApplication;
  isEditing: boolean;
  onChange: (updated: Partial<SellerApplication>) => void;
}

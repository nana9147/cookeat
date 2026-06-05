import { LucideIcon } from 'lucide-react';

export interface StateCard {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: LucideIcon;
}

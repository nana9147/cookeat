import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Package, FileClock, Boxes, Truck, PackageCheck, RotateCcw } from 'lucide-react';
import type { DashboardStatCardsProps } from '@/types/seller/dashboard';

const CARD_META = [
  {
    key: 'totalOrders',
    icon: Package,
    iconColor: 'text-primary',
    href: '/seller/orders',
    noDiffLabel: '누적',
  },
  {
    key: 'newOrders',
    icon: FileClock,
    iconColor: 'text-yellow',
    href: '/seller/orders',
    noDiffLabel: '오늘',
  },
  {
    key: 'preparingShipment',
    icon: Boxes,
    iconColor: 'text-primary',
    href: '/seller/shipping',
    noDiffLabel: '현재 처리 대기',
  },
  {
    key: 'shipping',
    icon: Truck,
    iconColor: 'text-primary',
    href: '/seller/shipping',
    noDiffLabel: '현재 배송 중',
  },
  {
    key: 'delivered',
    icon: PackageCheck,
    iconColor: 'text-primary',
    href: '/seller/shipping',
    noDiffLabel: '누적',
  },
  {
    key: 'cancelledOrRefunded',
    icon: RotateCcw,
    iconColor: 'text-red',
    href: '/seller/orders/cancel-refund',
    noDiffLabel: '현재 처리 대기',
  },
] as const;

export default function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {CARD_META.map(({ key, icon: Icon, iconColor, href, noDiffLabel }) => {
        const card = stats[key];
        const hasDiff = card.diff !== null;
        const diffSign = hasDiff && card.diff! > 0 ? '+' : '';
        const diffColor =
          hasDiff && card.diff! > 0
            ? 'text-primary'
            : hasDiff && card.diff! < 0
              ? 'text-red'
              : 'text-light-gray';

        return (
          <Link key={key} href={href}>
            <Card className="border-border shadow-sm transition-shadow hover:shadow-md cursor-pointer h-full">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-beige flex items-center justify-center">
                    <Icon size={14} className={iconColor} />
                  </div>
                  <p className="text-sm text-gray-text">{card.label}</p>
                </div>
                <p className="text-2xl font-bold text-dark-text">{card.count}건</p>
                {hasDiff ? (
                  <p className={`text-xs mt-2 font-medium ${diffColor}`}>
                    전일 대비 {diffSign}
                    {card.diff}
                  </p>
                ) : (
                  <p className="text-xs mt-2 font-medium text-light-gray">{noDiffLabel}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

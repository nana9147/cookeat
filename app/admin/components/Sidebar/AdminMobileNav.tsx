'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const menuItems = [
  { label: '대시보드', href: '/admin' },
  { label: '회원관리', href: '/admin/members' },
  { label: '판매자관리', href: '/admin/sellers' },
  { label: '상품관리', href: '/admin/products' },
  { label: '주문관리', href: '/admin/orders' },
  { label: '정산관리', href: '/admin/settlements' },
  { label: '쿠폰관리', href: '/admin/coupons' },
  { label: '레시피/포인트', href: '/admin/recipes' },
  { label: '리뷰/신고', href: '/admin/reviews' },
  { label: '고객센터', href: '/admin/support' },
  { label: '통계/분석', href: '/admin/analytics' },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = menuItems.find((item) => item.href === pathname) ?? menuItems[0];

  return (
    <div className="md:hidden w-full bg-white border-b">
      <button
        className="flex w-full items-center justify-between px-4 py-3 font-medium"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{active.label}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="flex flex-col border-t">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-left text-sm transition-colors ${
                pathname === item.href ? 'bg-primary text-white' : 'hover:bg-gray-50'
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

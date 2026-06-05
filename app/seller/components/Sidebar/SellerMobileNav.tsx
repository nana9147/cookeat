'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { label: '대시보드', href: '/seller' },
  { label: '상품관리', href: '/seller/products' },
  { label: '주문관리', href: '/seller/orders' },
  { label: '배송관리', href: '/seller/delivery' },
  { label: '리뷰관리', href: '/seller/reviews' },
  { label: '정산관리', href: '/seller/settlement' },
  { label: '판매자정보', href: '/seller/info' },
];

export default function SellerMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeItem = menuItems.find((item) =>
    item.href === '/seller' ? pathname === '/seller' : pathname.startsWith(item.href)
  );

  return (
    <div className="md:hidden w-full bg-white border-b">
      <button
        className="flex w-full items-center justify-between px-4 py-3 font-medium"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{activeItem?.label ?? '메뉴'}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="flex flex-col border-t">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/seller' ? pathname === '/seller' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-3 text-left text-sm transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-gray-50'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

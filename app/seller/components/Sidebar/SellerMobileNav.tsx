'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { label: '대시보드', href: '/seller' },
  { label: '상품관리', href: '/seller/products' },
  { label: '주문관리', href: '/seller/orders' },
  {
    label: '배송관리',
    href: '/seller/shipping',
    subItems: [
      { label: '배송 처리', href: '/seller/shipping' },
      { label: '주소 관리', href: '/seller/shipping/address' },
      { label: '템플릿 관리', href: '/seller/shipping/templates' },
    ],
  },
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
              <div key={item.label}>
                <Link
                  href={item.subItems ? item.subItems[0].href : item.href}
                  className={`px-4 py-3 text-left text-sm transition-colors block ${
                    isActive ? 'bg-primary text-white font-medium' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>

                {/* 활성 메뉴의 서브메뉴 */}
                {item.subItems && isActive && (
                  <div className="flex flex-col bg-primary/10">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`pl-8 pr-4 py-2.5 text-sm transition-colors ${
                          pathname === sub.href
                            ? 'text-primary font-semibold'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

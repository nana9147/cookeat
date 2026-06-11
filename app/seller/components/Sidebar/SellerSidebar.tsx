'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { CircleUser } from 'lucide-react';
import type { User } from '@/types/seller/user';

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

const userInfo: User = {
  store: '당근나라',
  email: 'carrot@naver.com',
};

export default function SellerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="hidden md:flex bg-primary text-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive =
                item.href === '/seller' ? pathname === '/seller' : pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`mb-1 mt-1 h-11 ${isActive ? 'bg-white text-gray-text font-semibold' : ''}`}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>

                  {/* 서브메뉴 */}
                  {item.subItems && isActive && (
                    <SidebarMenuSub>
                      {item.subItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === sub.href}
                            className={`text-white hover:bg-white hover:text-gray-text ${pathname === sub.href ? 'bg-white text-gray-text font-semibold' : ''}`}
                          >
                            <Link href={sub.href}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 p-4">
        <div className="flex items-center gap-4">
          <div>
            <CircleUser size={36} className="text-white opacity-70" />
          </div>
          <div>
            <p className="text-sm">{userInfo.store}</p>
            <p className="text-xs">{userInfo.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

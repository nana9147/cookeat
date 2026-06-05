'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { CircleUser } from 'lucide-react';
import type { User } from '@/types/seller/user';

const menuItems = [
  '대시보드',
  '상품관리',
  '주문관리',
  '배송관리',
  '리뷰관리',
  '정산관리',
  '판매자정보',
];

const userInfo: User = {
  store: '당근나라',
  email: 'carrot@naver.com',
};

export default function SellerSidebar() {
  const [active, setActive] = useState('대시보드');

  return (
    <Sidebar collapsible="none" className="hidden md:flex bg-primary text-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item}>
                <SidebarMenuButton
                  className={`mb-1 mt-1 h-11 ${active === item ? 'bg-white text-gray-text font-semibold' : ''}`}
                  onClick={() => setActive(item)}
                >
                  {item}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 p-4 ">
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

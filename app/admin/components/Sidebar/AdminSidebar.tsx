'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  '대시보드',
  '회원관리',
  '판매자관리',
  '상품관리',
  '주문관리',
  '정산관리',
  '레시피/포인트',
  '카테고리',
  '리뷰/신고',
  '고객센터',
  '통계/분석',
];

export default function AdminSidebar() {
  const [active, setActive] = useState('대시보드');

  return (
    <Sidebar
      collapsible="none"
      className="hidden md:flex bg-white"
      style={{ top: '6.25rem', height: 'calc(100svh - 6.25rem)' }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item}>
                <SidebarMenuButton
                  className={`mb-1 mt-1 h-11 ${active === item ? 'bg-primary text-white' : ''}`}
                  onClick={() => setActive(item)}
                >
                  {item}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

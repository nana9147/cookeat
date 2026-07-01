'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  { label: '대시보드', href: '/admin' },
  { label: '회원관리', href: '/admin/members' },
  { label: '판매자관리', href: '/admin/sellers' },
  { label: '상품관리', href: '/admin/products' },
  { label: '주문관리', href: '/admin/orders' },
  { label: '정산관리', href: '/admin/settlements' },
  { label: '레시피/포인트', href: '/admin/recipes' },
  { label: '리뷰/신고', href: '/admin/reviews' },
  { label: '고객센터', href: '/admin/support' },
  { label: '통계/분석', href: '/admin/analytics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="none"
      className="hidden md:flex bg-white"
      style={{ minHeight: 'calc(100svh - 6.25rem)' }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  className={`mb-1 mt-1 h-11 ${pathname === item.href ? 'bg-primary text-white hover:bg-primary hover:text-white' : ''}`}
                >
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

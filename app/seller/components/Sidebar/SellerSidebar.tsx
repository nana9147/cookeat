'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUser, Store, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { label: '대시보드', href: '/seller' },
  { label: '상품관리', href: '/seller/products' },
  {
    label: '주문관리',
    href: '/seller/orders',
    subItems: [
      { label: '주문 내역', href: '/seller/orders' },
      { label: '취소·환불 관리', href: '/seller/orders/cancel-refund' },
    ],
  },
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
  { label: '1:1 문의', href: '/seller/inquiries' },
  { label: '정산관리', href: '/seller/settlements' },
  { label: '통계', href: '/seller/statistics' },
  { label: '판매자정보', href: '/seller/info' },
];

interface SellerMe {
  store_name: string;
  email: string;
}

export default function SellerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [sellerInfo, setSellerInfo] = useState<SellerMe | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/seller/me');
        setSellerInfo({ store_name: data.data.store_name, email: data.data.email });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '판매자 정보를 불러오지 못했습니다.';
        toast.error(msg, { id: msg });
      }
    };
    fetchMe();
  }, []);

  const handleGoToShop = () => {
    window.open('/', '_blank');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '로그아웃 처리 중 문제가 발생했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      clearAuth();
      router.replace('/login');
    }
  };

  return (
    <Sidebar collapsible="none" className="hidden desktop:flex bg-primary text-white">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-4 w-full text-left hover:bg-white/10 rounded-lg p-1 transition-colors">
              <CircleUser size={36} className="text-white opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm truncate">{sellerInfo?.store_name ?? '불러오는 중...'}</p>
                <p className="text-xs truncate">{sellerInfo?.email ?? ''}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={handleGoToShop} className="cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              쇼핑몰로 이동
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red focus:text-red"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

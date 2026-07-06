'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CircleUser, Store, LogOut, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';
import { useSellerHeaderStore } from '@/store/sellerHeaderStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function SellerMobileDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarOpen = useSellerHeaderStore((state) => state.isSidebarOpen);
  const closeSidebar = useSellerHeaderStore((state) => state.closeSidebar);
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

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const handleGoToShop = () => {
    window.open('/', '_blank');
    closeSidebar();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '로그아웃 처리 중 문제가 발생했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      clearAuth();
      closeSidebar();
      router.replace('/login');
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 desktop:hidden" onClick={closeSidebar} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-mobile:w-64 bg-primary text-white z-50 flex flex-col shadow-xl transition-transform duration-300 desktop:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/20 shrink-0">
          <span className="font-bold">Cookeat 판매자센터</span>
          <button
            onClick={closeSidebar}
            aria-label="메뉴 닫기"
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/seller' ? pathname === '/seller' : pathname.startsWith(item.href);

            return (
              <div key={item.label} className="mb-1">
                <Link
                  href={item.subItems ? item.subItems[0].href : item.href}
                  className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-white text-gray-text font-semibold' : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>

                {item.subItems && isActive && (
                  <div className="mt-1 ml-3 flex flex-col border-l border-white/20 pl-3">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`py-2 text-sm transition-colors ${
                          pathname === sub.href
                            ? 'text-white font-semibold'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/20 p-4 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left hover:bg-white/10 rounded-lg p-1 transition-colors">
                <CircleUser size={32} className="text-white opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{sellerInfo?.store_name ?? '불러오는 중...'}</p>
                  <p className="text-xs text-white/70 truncate">{sellerInfo?.email ?? ''}</p>
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
        </div>
      </aside>
    </>
  );
}

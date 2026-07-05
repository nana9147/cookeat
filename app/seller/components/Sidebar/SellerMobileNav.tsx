'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Store, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  { label: '정산관리', href: '/seller/settlements' },
  { label: '판매자정보', href: '/seller/info' },
];

interface SellerMe {
  store_name: string;
  email: string;
}

export default function SellerMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<SellerMe | null>(null);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const activeItem = menuItems.find((item) =>
    item.href === '/seller' ? pathname === '/seller' : pathname.startsWith(item.href)
  );

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
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '로그아웃 처리 중 문제가 발생했습니다.';
      toast.error(msg, { id: msg });
    } finally {
      clearAuth();
      setOpen(false);
      router.replace('/login');
    }
  };

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

          <div className="border-t mt-1 pt-2 pb-1 px-4">
            <p className="text-sm font-medium text-dark-text truncate">
              {sellerInfo?.store_name ?? '불러오는 중...'}
            </p>
            <p className="text-xs text-gray-500 truncate mb-2">{sellerInfo?.email ?? ''}</p>
            <div className="flex flex-col">
              <button
                onClick={handleGoToShop}
                className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-primary transition-colors"
              >
                <Store size={16} />
                쇼핑몰로 이동
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2.5 text-sm text-red hover:text-red/80 transition-colors"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

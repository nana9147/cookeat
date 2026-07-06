'use client';

import { Menu } from 'lucide-react';
import { useSellerHeaderStore } from '@/store/sellerHeaderStore';

export default function HeaderMenuButton() {
  const openSidebar = useSellerHeaderStore((state) => state.openSidebar);

  return (
    <button
      onClick={openSidebar}
      aria-label="메뉴 열기"
      className="desktop:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
    >
      <Menu size={22} className="text-white" />
    </button>
  );
}
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ShoppingBanners from './components/ShoppingBanners';
import ShoppingClient from './components/ShoppingClient';

export default function ShoppingPage() {
  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1 text-xs text-light-gray mb-4">
        <Link href="/" className="hover:text-primary transition-colors">
          홈
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-text">재료 쇼핑</span>
      </nav>

      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl tablet:text-2xl font-bold text-dark-text">재료 쇼핑</h2>
        <p className="text-xs tablet:text-sm text-gray-text mt-1">
          신선한 식재료를 찾아보세요. 지역에서 가장 신뢰받는 재료를 한눈에 담아보세요.
        </p>
      </div>

      <ShoppingBanners />
      <ShoppingClient />
    </div>
  );
}

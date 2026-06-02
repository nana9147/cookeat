'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import HeaderNav from './HeaderNav';
import HeaderSearch from './HeaderSearch';
import HeaderActions from './HeaderActions';
import Sidebar from './Sidebar';

export default function Header() {
  const token = useAuthStore((state) => state.token);

  return (
    <>
      <header className="bg-background h-25 border-b border-border">
        <div className="max-w-360 mx-auto px-25 h-full flex items-center gap-8">
          <Link href="/" className="text-primary font-bold text-xl shrink-0">
            Cookeat
          </Link>
          <HeaderNav />
          <HeaderSearch />
          <HeaderActions token={token} />
        </div>
      </header>
      <Sidebar />
    </>
  );
}

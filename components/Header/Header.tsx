'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import HeaderNav from './HeaderNav';
import HeaderSearch from './HeaderSearch';
import HeaderActions from './HeaderActions';
import Sidebar from './Sidebar';

const AUTH_PATHS = ['/login', '/register'];

export default function Header() {
  const pathname = usePathname();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state._hydrated);

  if (AUTH_PATHS.includes(pathname)) return null;

  return (
    <>
      <header className="bg-background h-25 border-b border-border">
        <div className="max-w-360 mx-auto px-25 h-full flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl shrink-0">
            <Image
              src="/assets/cookeat.png"
              alt="Cookeat"
              width={300}
              height={280}
              className="w-10 h-auto"
            />
            <h1 className="text-h1 font-bold" suppressHydrationWarning>Cookeat</h1>
          </Link>
          <HeaderNav />
          <HeaderSearch />
          <HeaderActions token={hydrated ? token : null} />
        </div>
      </header>
      <Sidebar />
    </>
  );
}

'use client';

import Link from 'next/link';
import { CartIcon, MenuIcon, UserIcon } from './HeaderIcons';
import { useHeaderUIStore } from '@/store/headerStore';

interface Props {
  token: string | null;
}

export default function HeaderActions({ token }: Props) {
  const openSidebar = useHeaderUIStore((state) => state.openSidebar);

  return (
    <div className="flex items-center gap-1 ml-auto desktop:ml-0 shrink-0">
      {token ? (
        <>
          <button className="hidden desktop:block p-2 text-dark-text hover:text-primary transition-colors">
            <CartIcon />
          </button>
          <button className="hidden desktop:block p-2 text-dark-text hover:text-primary transition-colors">
            <UserIcon />
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="hidden desktop:inline-flex px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-hover transition-colors"
        >
          로그인
        </Link>
      )}

      {/* 모바일/태블릿 햄버거 */}
      <button
        onClick={openSidebar}
        className="desktop:hidden p-2 text-dark-text hover:text-primary transition-colors"
      >
        <MenuIcon />
      </button>
    </div>
  );
}

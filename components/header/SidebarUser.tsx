import Link from 'next/link';
import { useHeaderUIStore } from '@/store/headerStore';
import { CartIcon, UserIcon } from './HeaderIcons';

interface Props {
  token: string | null;
}

export default function SidebarUser({ token }: Props) {
  const closeSidebar = useHeaderUIStore((state) => state.closeSidebar);

  return (
    <div className="px-6 py-5 border-b border-border">
      {token ? (
        <div className="flex items-center justify-between">
          <Link
            href="/mypage"
            onClick={closeSidebar}
            className="flex items-center gap-3 text-dark-text hover:text-primary transition-colors"
          >
            <UserIcon />
            <span className="text-sm font-medium">마이페이지</span>
          </Link>
          <Link
            href="/cart"
            onClick={closeSidebar}
            className="text-dark-text hover:text-primary transition-colors"
          >
            <CartIcon />
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          onClick={closeSidebar}
          className="block w-full text-center py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-hover transition-colors"
        >
          로그인
        </Link>
      )}
    </div>
  );
}

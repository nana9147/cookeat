import Link from 'next/link';
import { useHeaderUIStore } from '@/store/header/headerStore';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/recipes', label: '레시피' },
  { href: '/shopping', label: '재료 쇼핑' },
];

export default function SidebarNav() {
  const closeSidebar = useHeaderUIStore((state) => state.closeSidebar);

  return (
    <nav className="flex flex-col px-6 py-4 gap-1">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={closeSidebar}
          className="py-3 text-dark-text text-h5 font-medium hover:text-primary transition-colors border-b border-border last:border-0"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/recipes', label: '레시피' },
  { href: '/shopping', label: '재료 쇼핑' },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden desktop:flex items-center gap-6 shrink-0">
      {navLinks.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center gap-1 text-dark-text text-h5 font-medium hover:text-primary transition-colors"
          >
            <h2 className={`text-h4 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</h2>
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

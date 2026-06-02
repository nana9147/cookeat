import Link from 'next/link';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/recipes', label: '레시피' },
  { href: '/shopping', label: '재료 쇼핑' },
];

export default function HeaderNav() {
  return (
    <nav className="hidden desktop:flex items-center gap-6 shrink-0">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-dark-text text-h5 font-medium hover:text-primary transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

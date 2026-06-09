'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { sections } from './CategoryData';

export default function MypageCategory() {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearAuth();
    alert('로그아웃되었습니다.');
    router.replace('/');
  };

  return (
    <nav className="overflow-hidden rounded-2xl bg-white">
      {sections.map((section, i) => (
        <div key={i} className="border-t border-border first:border-0">
          {section.title && <p className="px-5 pt-3 text-xs text-gray-text">{section.title}</p>}
          <ul className="p-2">
            {section.items.map(({ icon, label, href }) => {
              const isActive = pathname === href;
              const isLogout = href === '/mypage/logout';
              return (
                <li
                  key={label}
                  onClick={isLogout ? handleLogout : () => router.push(href)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-4.25 text-sm transition-colors
                    ${isActive ? 'bg-primary text-white' : 'text-dark-text hover:bg-primary hover:text-white'}`}
                >
                  {icon}
                  <span className="flex-1">{label}</span>
                  <span className={isActive ? 'text-white' : 'text-muted group-hover:text-white'}>›</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

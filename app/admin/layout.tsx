'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import AdminAuthGuard from './components/AdminAuthGuard';
import Header from './components/Header/Header';
import AdminSidebar from './components/Sidebar/AdminSidebar';
import AdminMobileNav from './components/Sidebar/AdminMobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <Header />
      <div className="flex flex-1 min-w-0">
        <SidebarProvider style={{ minHeight: '76px' }}>
          <AdminSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <AdminMobileNav />
            <main className="flex flex-1 flex-col min-w-0">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </AdminAuthGuard>
  );
}

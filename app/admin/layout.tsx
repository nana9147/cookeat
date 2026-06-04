import { SidebarProvider } from '@/components/ui/sidebar';
import Header from './components/Header/Header';
import AdminSidebar from './components/Sidebar/AdminSidebar';
import AdminMobileNav from './components/Sidebar/AdminMobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-1">
        <SidebarProvider style={{ minHeight: '76px' }}>
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminMobileNav />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}

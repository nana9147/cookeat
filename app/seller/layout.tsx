import { SidebarProvider } from '@/components/ui/sidebar';
import SellerAuthGuard from './components/SellerAuthGuard';
import Header from './components/Header/Header';
import SellerSidebar from './components/Sidebar/SellerSidebar';
import SellerMobileNav from './components/Sidebar/SellerMobileNav';
import SellerAdminViewInitializer from './components/SellerAdminViewInitializer';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerAuthGuard>
      <SellerAdminViewInitializer />
      <Header />
      <div className="flex flex-1">
        <SidebarProvider style={{ minHeight: '6.25rem' }}>
          <SellerSidebar />
          <div className="flex flex-1 flex-col">
            <SellerMobileNav />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </SidebarProvider>
      </div>
    </SellerAuthGuard>
  );
}

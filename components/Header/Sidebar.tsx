'use client';

import { useAuthStore } from '@/store/authStore';
import { useHeaderUIStore } from '@/store/header/headerStore';
import SidebarHeader from './SidebarHeader';
import SidebarUser from './SidebarUser';
import SidebarSearch from './SidebarSearch';
import SidebarNav from './SidebarNav';

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useHeaderUIStore();
  const token = useAuthStore((state) => state.token);

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 desktop:hidden" onClick={closeSidebar} />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-background z-50 flex flex-col shadow-xl transition-transform duration-300 desktop:hidden ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SidebarHeader />
        <SidebarUser token={token} />
        <SidebarSearch />
        <SidebarNav />
      </aside>
    </>
  );
}

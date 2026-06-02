import { useHeaderUIStore } from '@/store/header/headerStore';

export default function SidebarHeader() {
  const closeSidebar = useHeaderUIStore((state) => state.closeSidebar);

  return (
    <div className="flex items-center justify-between px-6 h-25 border-b border-border shrink-0">
      <span className="text-primary font-bold text-xl">Cookeat</span>
      <button onClick={closeSidebar} className="text-dark-text hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import Header from './components/Header/Header';

const menuItems = [
  '대시보드',
  '회원관리',
  '판매자관리',
  '상품관리',
  '주문관리',
  '정산관리',
  '레시피/포인트',
  '카테고리',
  '리뷰/신고',
  '고객센터',
  '통계/분석',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-1">
        <SidebarProvider style={{ minHeight: '76px' }}>
          <Sidebar collapsible="none" style={{ top: '6.25rem', height: 'calc(100svh - 6.25rem)' }}>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item}>
                      <SidebarMenuButton className="mb-1">{item}</SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-1 flex-col">{children}</main>
        </SidebarProvider>
      </div>
    </>
  );
}

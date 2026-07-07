import MypageGuard from '@/components/(auth)/mypage/MypageGuard';
import UserCard from '@/components/(auth)/mypage/UserCard';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <MypageGuard>
      <UserCard>{children}</UserCard>
    </MypageGuard>
  );
}

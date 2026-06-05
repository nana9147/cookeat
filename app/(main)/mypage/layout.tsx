import UserCard from '@/components/(auth)/mypage/UserCard';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return <UserCard>{children}</UserCard>;
}

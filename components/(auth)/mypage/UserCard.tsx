'use client';

// 마이페이지 메인 레이아웃
// - 사용자 정보 / 통계 / 카테고리+콘텐츠 3단 구조
// - 반응형: mobile(세로스택, 통계2×2) → tablet(세로스택, 통계4열) → desktop(사이드바 2컬럼)

import { PointIcon, StarIcon, OrderIcon, RecipeIcon, LikeIcon, ViewIcon } from './UserIcons';
import MypageCategory from './MypageCategory';
import { useUserInfo } from '@/hooks/user/useUserInfo';

const stats = [
  { icon: <OrderIcon />, label: '총 주문' },
  { icon: <RecipeIcon />, label: '내 레시피' },
  { icon: <LikeIcon />, label: '찜한 상품' },
  { icon: <ViewIcon />, label: '누적 조회' },
];

export default function UserCard({ children }: { children: React.ReactNode }) {
  const { nickname, email, profileImage, point } = useUserInfo();

  return (
    <div className="mx-auto w-full max-w-360 space-y-3 px-4 py-6 tablet:px-12 desktop:px-40">
      {/* 사용자 정보 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 tablet:flex-row tablet:items-center">
        {profileImage
          ? <img src={profileImage} alt="프로필" className="size-16 shrink-0 rounded-full object-cover" />
          : <div className="size-16 shrink-0 rounded-full bg-primary" />
        }
        <div className="space-y-1 text-center tablet:text-left">
          <h2 className="font-bold text-dark-text">{nickname || '-'}</h2>
          <p className="text-xs text-gray-text">{email || '-'}</p>
          <div className="flex justify-center gap-2 tablet:justify-start">
            <span className="flex items-center gap-1 rounded-full bg-beige px-3 py-0.5 text-xs text-dark-text"><PointIcon />{point.toLocaleString()}P</span>
            <span className="flex items-center gap-1 rounded-full bg-beige px-3 py-0.5 text-xs text-dark-text"><StarIcon />등급</span>
          </div>
        </div>
      </div>

      {/* 통계 - 모바일 2×2, 태블릿+ 4열 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border tablet:grid-cols-4">
        {stats.map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 bg-white py-5">
            {icon}
            <span className="font-bold text-dark-text">-</span>
            <span className="text-xs text-gray-text">{label}</span>
          </div>
        ))}
      </div>

      {/* 카테고리 | 콘텐츠 - 모바일/태블릿: 세로 스택, 데스크탑: 2컬럼 */}
      <div className="flex flex-col gap-5 desktop:flex-row">
        <aside className="w-full desktop:w-64 desktop:shrink-0">
          <MypageCategory />
        </aside>
        <main className="min-h-96 flex-1 rounded-2xl bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

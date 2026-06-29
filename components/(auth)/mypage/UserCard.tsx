'use client';

// 마이페이지 메인 레이아웃
// - 사용자 정보 / 통계 / 카테고리+콘텐츠 3단 구조
// - 반응형: mobile(세로스택, 통계2×2) → tablet(세로스택, 통계4열) → desktop(사이드바 2컬럼)

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { PointIcon, StarIcon, LikeIcon } from './UserIcons';
import MypageCategory from './MypageCategory';
import { useUserInfo } from '@/hooks/user/useUserInfo';
import api from '@/lib/api';

type Stats = { bookmarkCount: number; wishlistCount: number };

export default function UserCard({ children }: { children: React.ReactNode }) {
  const { nickname, email, profileImage, point } = useUserInfo();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/users/me/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-360 space-y-3 px-4 py-6 tablet:px-12 desktop:px-40">
      {/* 사용자 정보 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 tablet:flex-row tablet:items-center">
        {profileImage
          ? <Image src={profileImage} alt="프로필" width={64} height={64} className="size-16 shrink-0 rounded-full object-cover" />
          : <div className="size-16 shrink-0 rounded-full bg-primary" />
        }
        <div className="space-y-1 text-center tablet:text-left">
          <h2 className="font-bold text-dark-text" suppressHydrationWarning>{nickname || '-'}</h2>
          <p className="text-xs text-gray-text">{email || '-'}</p>
          <div className="flex justify-center gap-2 tablet:justify-start">
            <span className="flex items-center gap-1 rounded-full bg-beige px-3 py-0.5 text-xs text-dark-text"><PointIcon />{point.toLocaleString()}P</span>
            <span className="flex items-center gap-1 rounded-full bg-beige px-3 py-0.5 text-xs text-dark-text"><StarIcon />등급</span>
            <span className="flex items-center gap-1 rounded-full bg-beige px-3 py-0.5 text-xs text-dark-text">
              <LikeIcon />찜 {stats != null ? (stats.bookmarkCount + stats.wishlistCount) : '-'}
            </span>
          </div>
        </div>
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

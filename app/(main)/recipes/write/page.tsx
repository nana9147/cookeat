import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MypageGuard from '@/components/(auth)/mypage/MypageGuard';
import RecipeWriteForm from './_components/RecipeWriteForm';

export default function RecipeWritePage() {
  return (
    <MypageGuard>
      <div className="max-w-180 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
        <nav className="flex items-center gap-1 text-xs text-light-gray mb-4">
          <Link href="/" className="hover:text-primary transition-colors">
            홈
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/recipes" className="hover:text-primary transition-colors">
            레시피
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-text">레시피 작성</span>
        </nav>

        <div className="flex items-center gap-2 mb-1">
          <Link href="/recipes" className="text-dark-text hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl tablet:text-2xl font-bold text-dark-text">레시피 작성</h2>
        </div>
        <p className="text-xs tablet:text-sm text-gray-text mb-6 ml-7">
          나만의 레시피를 공유해보세요.
        </p>

        <RecipeWriteForm />
      </div>
    </MypageGuard>
  );
}

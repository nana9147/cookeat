import Link from 'next/link';
import { ChevronRight, PenSquare } from 'lucide-react';
import RecipeClient from './_components/RecipeClient';

export default function RecipesPage() {
  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      <nav className="flex items-center gap-1 text-xs text-light-gray mb-4">
        <Link href="/" className="hover:text-primary transition-colors">홈</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-text">레시피</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl tablet:text-2xl font-bold text-dark-text">레시피</h2>
          <p className="text-xs tablet:text-sm text-gray-text mt-1">
            맛있는 레시피를 찾아보세요. 쉐프처럼 맛있는 요리로 한번에 담아보세요.
          </p>
        </div>
        <Link
          href="/recipes/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          레시피 작성
        </Link>
      </div>

      <RecipeClient />
    </div>
  );
}

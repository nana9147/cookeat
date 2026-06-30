'use client';

import { Bookmark } from 'lucide-react';
import { useBookmark } from '@/hooks/user/useBookmark';

export default function RecipeBookmarkButton({ recipeId }: { recipeId: number }) {
  const { isActive, count, toggle, loading } = useBookmark(recipeId);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50
        ${isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border text-gray-text hover:bg-hover'}`}
    >
      <Bookmark className={`w-4 h-4 ${isActive ? 'fill-primary' : ''}`} />
      <span>찜 {count > 0 ? count : ''}</span>
    </button>
  );
}

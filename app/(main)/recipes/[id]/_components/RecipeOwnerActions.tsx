'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function RecipeOwnerActions({
  recipeId,
  authorUserId,
}: {
  recipeId: number;
  authorUserId: number;
}) {
  const isOwner = useAuthStore((s) => s.user?.dbUserId === authorUserId);
  if (!isOwner) return null;

  return (
    <Link
      href={`/recipes/${recipeId}/edit`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm font-medium text-gray-text hover:bg-hover transition-colors"
    >
      <Pencil className="w-4 h-4" />
      <span>수정</span>
    </Link>
  );
}

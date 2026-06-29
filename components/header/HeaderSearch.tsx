'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './HeaderIcons';

export default function HeaderSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    router.push(`/search?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 hidden desktop:flex items-center justify-end">
      <div className="flex w-80 h-10 rounded-full border border-border bg-white overflow-hidden focus-within:border-primary transition-colors">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="레시피·재료 검색"
          className="flex-1 px-4 text-sm text-dark-text placeholder:text-light-gray outline-none bg-transparent min-w-0"
        />
        <button
          type="submit"
          className="px-3 text-gray-text hover:text-primary transition-colors shrink-0"
          aria-label="검색"
        >
          <SearchIcon size={18} />
        </button>
      </div>
    </form>
  );
}

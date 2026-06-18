import { useState, useEffect } from 'react';
import { getPageNumbers } from '@/lib/utils';

export function usePagination<T>(items: T[], pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginated = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    currentPage,
    setCurrentPage,
    paginated,
    totalPages,
    getPageNumbers: () => getPageNumbers(currentPage, totalPages),
  };
}

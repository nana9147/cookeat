import { ShoppingProduct } from '@/types/ingredient';
import { getPageNumbers } from '../utils/shoppingFilter';
import ShoppingGrid from './ShoppingGrid';
import Pagination from '@/components/ui/Pagination';

interface ShoppingProductAreaProps {
  error: string | null;
  isLoading: boolean;
  products: ShoppingProduct[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ShoppingProductArea({
  error,
  isLoading,
  products,
  currentPage,
  totalPages,
  onPageChange,
}: ShoppingProductAreaProps) {
  return (
    <>
      {error ? (
        <div className="py-20 text-center text-sm text-red-500">{error}</div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card-bg animate-pulse aspect-3/4"
            />
          ))}
        </div>
      ) : (
        <ShoppingGrid products={products} />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getPageNumbers={() => getPageNumbers(currentPage, totalPages)}
      />
    </>
  );
}

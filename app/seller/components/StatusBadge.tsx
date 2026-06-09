import type { ProductStatus } from '@/types/seller/product';

export default function StatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<ProductStatus, string> = {
    판매대기: 'bg-blue-100 text-blue-700',
    판매중: 'bg-green-100 text-green-700',
    품절: 'bg-red-100 text-red-600',
    판매종료: 'bg-gray-100 text-gray-500',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}

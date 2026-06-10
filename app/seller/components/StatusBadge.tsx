import { OrderStatus } from '@/types/seller/order';
import type { ProductStatus } from '@/types/seller/product';

export default function StatusBadge({ status }: { status: ProductStatus | OrderStatus }) {
  const styles: Record<ProductStatus | OrderStatus, string> = {
    판매대기: 'bg-blue-100 text-blue-700',
    판매중: 'bg-green-100 text-green-700',
    품절: 'bg-red-100 text-red-600',
    판매종료: 'bg-gray-100 text-gray-500',

    결제완료: 'bg-emerald-50 text-primary border border-emerald-200',
    배송준비중: 'bg-amber-50 text-yellow border border-amber-200',
    배송중: 'bg-blue-50 text-blue-600 border border-blue-200',
    배송완료: 'bg-beige-50 text-muted border border-border',
    취소: 'bg-slate-50 text-slate-500 border border-slate-200',
    환불: 'bg-red-50 text-red-600 border border-red-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>
  );
}

import type { BadgeStatus } from '@/types/seller/status';

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const styles: Record<BadgeStatus, string> = {
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

    기본출고지: 'bg-violet-50 text-violet-600 border border-violet-200',
    기본반품지: 'bg-cyan-50 text-cyan-600 border border-cyan-200',

    무료: 'bg-emerald-100 text-emerald-700',
    유료: 'bg-amber-100 text-amber-700',
    '조건부 무료': 'bg-sky-100 text-sky-700',

    정산완료: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    정산예정: 'bg-blue-50 text-blue-600 border border-blue-200',
    정산보류: 'bg-amber-50 text-yellow border border-amber-200',

    pending: 'bg-amber-50 text-amber-600 border border-amber-200',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-50 text-red-600 border border-red-200',
  };

  const labels: Partial<Record<BadgeStatus, string>> = {
    pending: '승인 대기',
    approved: '승인 완료',
    rejected: '승인 거절',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status] ?? status}
    </span>
  );
}

const btnBase =
  'w-8 h-8 rounded-lg border border-border text-sm text-gray-text hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

type Props = {
  page: number;
  total: number;
  limit: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
};

export default function OrderPagination({ page, total, limit, hasNext, onPageChange }: Props) {
  const pages = Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    page + 2,
  );

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btnBase}>
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-primary text-white' : 'border border-border text-gray-text hover:bg-hover'
          }`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={!hasNext} className={btnBase}>
        ›
      </button>
    </div>
  );
}

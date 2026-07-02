'use client';

import Image from 'next/image';

interface OrderItemReviewRowProps {
  itemId: number;
  name: string;
  image: string | null;
  quantity: number;
  done: boolean;
  onWrite: () => void;
}

export function OrderItemReviewRow({
  name,
  image,
  quantity,
  done,
  onWrite,
}: OrderItemReviewRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
      <div className="relative w-14 h-14 rounded-xl bg-card-bg shrink-0 overflow-hidden">
        {image ? (
          <Image src={image} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-text truncate">{name}</p>
        <p className="text-xs text-gray-text mt-0.5">{quantity}개</p>
      </div>
      <button
        disabled={done}
        onClick={onWrite}
        className={[
          'shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
          done
            ? 'bg-beige text-muted cursor-default'
            : 'bg-primary text-white hover:bg-primary/90',
        ].join(' ')}
      >
        {done ? '작성 완료' : '리뷰 쓰기'}
      </button>
    </div>
  );
}

'use client';

import { Star } from 'lucide-react';

const RATING_LABEL = ['', '별로에요', '그저 그래요', '보통이에요', '좋아요', '최고예요'];

interface StarRatingInputProps {
  rating: number;
  hoverRating: number;
  onRate: (star: number) => void;
  onHover: (star: number) => void;
  onLeave: () => void;
}

export function StarRatingInput({
  rating,
  hoverRating,
  onRate,
  onHover,
  onLeave,
}: StarRatingInputProps) {
  const displayed = hoverRating || rating;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="p-1"
          >
            <Star
              className={[
                'w-8 h-8 transition-colors',
                star <= displayed ? 'fill-yellow text-yellow' : 'text-border',
              ].join(' ')}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-text h-5">{RATING_LABEL[displayed] ?? ''}</span>
    </div>
  );
}

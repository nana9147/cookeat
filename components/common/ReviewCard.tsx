import { StarRating } from './StarRating';

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-card-bg flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-gray-text">{review.authorName.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-dark-text">{review.authorName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} />
            <span className="text-xs text-muted">{review.createdAt}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-text leading-relaxed">{review.content}</p>
    </div>
  );
}

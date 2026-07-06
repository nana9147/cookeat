import { StarRating } from './StarRating';
import { ReviewAvatar } from './ReviewAvatar';
import { ReviewImages } from './ReviewImages';

export interface ApiReview {
  reviewId: number;
  userId: number;
  authId: string;
  nickname: string;
  profileImage: string | null;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
}

interface ReviewCardProps {
  review: ApiReview;
  currentAuthId?: string;
  onEdit?: (review: ApiReview) => void;
  onDelete?: (reviewId: number) => void;
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.');
}

export function ReviewCard({ review, currentAuthId, onEdit, onDelete }: ReviewCardProps) {
  const isOwner = !!currentAuthId && review.authId === currentAuthId;
  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <ReviewAvatar nickname={review.nickname} profileImage={review.profileImage} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-dark-text truncate">{review.nickname}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={review.rating} />
              <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit?.(review)} className="text-xs text-gray-text hover:text-dark-text transition-colors px-1 py-0.5">수정</button>
            <span className="text-xs text-border">|</span>
            <button onClick={() => onDelete?.(review.reviewId)} className="text-xs text-gray-text hover:text-red transition-colors px-1 py-0.5">삭제</button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-text leading-relaxed">{review.content}</p>
      <ReviewImages images={review.images} />
    </div>
  );
}

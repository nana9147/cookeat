export interface Review {
  id: string;
  name: string;
  rating: number;
  createdAt: string;
  product: string;
  content: string;
  images?: string[];
  reply?: string;
}

export type ReviewTabFilter = '전체' | '답변 대기' | '별점 높은 순' | '사진 리뷰';

export interface ReviewFilterTabsProps {
  filter: ReviewTabFilter;
  onFilterChange: (value: ReviewTabFilter) => void;
  ratingFilter?: number;
  onRatingChange: (value: number) => void;
}

export interface ReviewSummary {
  totalCount: number;
  averageRating: number;
  pendingReplyCount: number;
}

export interface ReviewSummaryCardsProps {
  summary: ReviewSummary;
}

export interface ReviewCardProps {
  review: Review;
  onReplyClick: (review: Review) => void;
  onReportClick: (review: Review) => void;
  onImageClick: (url: string) => void;
}

export interface ReviewListProps {
  reviews: Review[];
  onReplyClick: (review: Review) => void;
  onReportClick: (review: Review) => void;
  onImageClick: (url: string) => void;
}

export interface ReviewReplyModalProps {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onSubmit: (reviewId: string, reply: string) => void;
}

export interface ReviewReportModalProps {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onSubmit: (reviewId: string, reason: string) => void;
}

export interface ReviewImageModalProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

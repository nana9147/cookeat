export type ReviewStatus = '정상' | '신고' | '처리완료';

export interface Review {
  reviewId: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  images: string[];
  status: ReviewStatus;
  reportCount: number;
  reply: {
    replyId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
}

export type ReviewTabFilter = '전체' | '답변 대기' | '별점 높은 순' | '사진 리뷰';

export type ReviewSortOrder = 'rating_desc' | 'rating_asc';

export interface ReviewSummaryCardsProps {
  summary: ReviewSummary;
  filter: ReviewTabFilter;
  sortOrder?: ReviewSortOrder;
  onResetFilter: () => void;
  onPendingReplyClick: () => void;
  onSortToggle: () => void;
}

export interface ReviewFilterTabsProps {
  filter: ReviewTabFilter;
  onFilterChange: (value: ReviewTabFilter) => void;
  ratingFilter?: number;
  onRatingChange: (value: number | undefined) => void;
}

export interface ReviewSummary {
  totalCount: number;
  averageRating: number;
  pendingReplyCount: number;
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
  onSubmit: (reviewId: number, reply: string) => void;
}

export interface ReviewReportModalProps {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onSubmit: (reviewId: number, reason: string) => void;
}

export interface ReviewImageModalProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

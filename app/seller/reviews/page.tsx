'use client';

import { useState } from 'react';
import type { Review, ReviewTabFilter } from '@/types/seller/review';
import ReviewSummaryCards from '@/app/seller/components/ReviewList/ReviewSummaryCards';
import ReviewFilterTabs from '@/app/seller/components/ReviewList/ReviewFilterTabs';
import ReviewList from '@/app/seller/components/ReviewList/ReviewList';
import ReviewReplyModal from '@/app/seller/components/ReviewList/ReviewReplyModal';
import ReviewReportModal from '@/app/seller/components/ReviewList/ReviewReportModal';
import ReviewImageModal from '@/app/seller/components/ReviewList/ReviewImageModal';
import type { ReviewSummary } from '@/types/seller/review';

const MOCK_SUMMARY: ReviewSummary = {
  totalCount: 148,
  averageRating: 4.6,
  pendingReplyCount: 12,
};

const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    name: '김봄',
    rating: 5,
    createdAt: '2026-06-16',
    product: '청송 사과 1kg',
    content: '최근 사먹은 사과중에 제일 달고 맛있어요!',
    reply: '항상 좋은 품질의 사과를 제공할 수 있도록 노력하겠습니다.',
  },
  {
    id: 'REV-002',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-003',
    name: '최가을',
    rating: 5,
    createdAt: '2026-06-16',
    product: '청송 사과 1kg',
    content: '최근 사먹은 사과중에 제일 달고 맛있어요!',
    images: [
      'https://image.8dogam.com/resized/product/asset/v1/upload/e017527565474808a79b88adc5b6a4f0.jpeg?type=big&res=3x&ext=jpg',
      'https://www.korea.kr/newsWeb/resources/temp/images/000052/%EC%82%AC%EA%B3%BC_%EB%B3%B8%EB%AC%B8.jpg',
    ],
    reply: '항상 좋은 품질의 사과를 제공할 수 있도록 노력하겠습니다.',
  },
  {
    id: 'REV-004',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-005',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-006',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-007',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-008',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-009',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-0010',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
  {
    id: 'REV-011',
    name: '이여름',
    rating: 2,
    createdAt: '2026-06-16',
    product: '호박고구마 3kg',
    content: '맛은 괜찮은데.. 너무 바람들어왔네요..;;',
  },
];

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState<ReviewTabFilter>('전체');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 필터링 로직
  const filteredReviews = reviews
    .filter((r) => {
      if (filter === '답변 대기') return !r.reply;
      if (filter === '사진 리뷰') return r.images && r.images.length > 0;
      return true;
    })
    .filter((r) => (ratingFilter === 0 ? true : r.rating === ratingFilter))
    .sort((a, b) => {
      if (filter === '별점 높은 순') return b.rating - a.rating;
      return 0;
    });

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setReplyModalOpen(true);
  };

  const handleReportClick = (review: Review) => {
    setSelectedReview(review);
    setReportModalOpen(true);
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setImageModalOpen(true);
  };

  const handleReplySubmit = (reviewId: string, reply: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply } : r)));
  };

  const handleReportSubmit = (reviewId: string, reason: string) => {
    console.log('신고 접수:', reviewId, reason);
  };

  return (
    <div className="p-6">
      <h1 className="text-h2 font-bold text-dark-text mb-6">리뷰 관리</h1>
      <ReviewSummaryCards summary={MOCK_SUMMARY} />
      <ReviewFilterTabs
        filter={filter}
        onFilterChange={setFilter}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
      />
      <ReviewList
        reviews={filteredReviews}
        onReplyClick={handleReplyClick}
        onReportClick={handleReportClick}
        onImageClick={handleImageClick}
      />
      <ReviewReplyModal
        open={replyModalOpen}
        review={selectedReview}
        onClose={() => setReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
      />
      <ReviewReportModal
        open={reportModalOpen}
        review={selectedReview}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
      <ReviewImageModal
        open={imageModalOpen}
        imageUrl={selectedImage}
        onClose={() => setImageModalOpen(false)}
      />
    </div>
  );
}

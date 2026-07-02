'use client';

import { RatingSummary } from './RatingSummary';
import { ReviewBody } from './ReviewBody';
import { ReviewSectionHeader } from './ReviewSectionHeader';
import { type ApiReview } from './ReviewCard';
import ReviewWriteModal from './ReviewWriteModal';
import { useReviewSection } from '@/hooks/useReviewSection';

interface ReviewSectionClientProps {
  type: 'recipe' | 'product';
  targetId: number;
  targetName?: string;
  compact?: boolean;
  onViewAll?: () => void;
}

export default function ReviewSectionClient({ type, targetId, targetName, compact = false, onViewAll }: ReviewSectionClientProps) {
  const { data, allReviews, hasMore, loading, currentAuthId, canWrite, totalCount, writeModal, editTarget, setWriteModal, setEditTarget, refresh, handleLoadMore, handleDelete } = useReviewSection({ type, targetId, compact });

  if (loading) return (
    <section className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-beige animate-pulse" />)}
    </section>
  );

  return (
    <section>
      <ReviewSectionHeader totalCount={totalCount} canWrite={canWrite} compact={compact} onViewAll={onViewAll} onWriteClick={() => setWriteModal(true)} />
      {totalCount > 0 && (
        <div className="mb-6">
          <RatingSummary averageRating={data?.averageRating ?? 0} totalCount={totalCount} ratingBreakdown={data?.ratingBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }} />
        </div>
      )}
      <ReviewBody reviews={allReviews} compact={compact} hasMore={hasMore} currentAuthId={currentAuthId} onViewAll={onViewAll} onLoadMore={handleLoadMore} onEdit={setEditTarget} onDelete={handleDelete} />
      {writeModal && (
        <ReviewWriteModal type={type} targetId={targetId} targetName={targetName} onClose={() => setWriteModal(false)} onSuccess={refresh} />
      )}
      {editTarget && (
        <ReviewWriteModal type={type} targetId={targetId} targetName={targetName} existingReview={editTarget as Pick<ApiReview, 'reviewId' | 'rating' | 'content'>} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); refresh(); }} />
      )}
    </section>
  );
}

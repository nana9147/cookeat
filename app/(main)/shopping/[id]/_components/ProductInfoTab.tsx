import { Review } from '@/components/common/ReviewSection';
import ProductDescription from './ProductDescription';
import RelatedRecipes from './RelatedRecipes';
import { InfoTabReviewPreview } from './InfoTabReviewPreview';

interface Props {
  title: string;
  description: string;
  imageUrl?: string;
  features: { title: string; desc: string }[];
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  onViewAllReviews: () => void;
}

export function ProductInfoTab({
  title, description, imageUrl, features,
  reviews, reviewCount, averageRating, ratingBreakdown, onViewAllReviews,
}: Props) {
  return (
    <>
      <ProductDescription
        title={title}
        description={description}
        imageUrl={imageUrl}
        features={features}
      />
      <RelatedRecipes />
      <InfoTabReviewPreview
        reviews={reviews}
        reviewCount={reviewCount}
        averageRating={averageRating}
        ratingBreakdown={ratingBreakdown}
        onViewAll={onViewAllReviews}
      />
    </>
  );
}

import ProductDescription from './ProductDescription';
import RelatedRecipes from './RelatedRecipes';
import ReviewSectionClient from '@/components/common/ReviewSectionClient';

interface Props {
  productId: number;
  productName: string;
  title: string;
  description: string;
  imageUrl?: string;
  features: { title: string; desc: string }[];
  onViewAllReviews: () => void;
}

export function ProductInfoTab({
  productId,
  productName,
  title,
  description,
  imageUrl,
  features,
  onViewAllReviews,
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
      <div className="mt-10">
        <ReviewSectionClient
          type="product"
          targetId={productId}
          targetName={productName}
          compact
          onViewAll={onViewAllReviews}
        />
      </div>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import { MOCK_REVIEWS, MOCK_RATING_BREAKDOWN } from '../data/mockReviews';
import ProductImageGallery from './_components/ProductImageGallery';
import ProductTabs from './_components/ProductTabs';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);
  if (!product) notFound();

  const details = [
    { label: '카테고리', value: product.category },
    { label: '원산지', value: '국내산' },
    { label: '용량', value: product.volume ?? '-' },
    { label: '판매자', value: product.seller },
  ];

  const options = [{ label: `${product.name} (기본)`, price: product.price }];

  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      <nav className="flex items-center gap-1 text-xs text-light-gray mb-6">
        <Link href="/" className="hover:text-primary transition-colors">홈</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shopping" className="hover:text-primary transition-colors">재료 쇼핑</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-text">{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 desktop:grid-cols-2 desktop:gap-12 gap-6">
        <ProductImageGallery
          images={product.imageUrl ? [product.imageUrl] : []}
          name={product.name}
          isNew={product.isNew}
          discountRate={product.discountRate}
        />
        <ProductPurchasePanel
          name={product.name}
          category={product.category}
          rating={product.rating}
          reviewCount={product.reviewCount}
          qnaCount={2}
          price={product.price}
          discountRate={product.discountRate}
          details={details}
          options={options}
          stock={product.stock}
        />
      </div>
      <ProductTabs
        descriptionTitle={`${product.seller}에서 직접 보내는 ${product.name}`}
        description={`신선한 ${product.name}을 산지에서 직접 보내드립니다.\n\n수확 후 당일 출고하여 최상의 신선도를 유지합니다. 요리의 기본이 되는 재료인 만큼 품질 하나만큼은 자신 있습니다.`}
        features={[
          { title: '소규모 재배', desc: '가족 농장에서 정성껏 키운 신선한 재료입니다.' },
          { title: '산지직송', desc: '중간 유통 없이 산지에서 바로 보내드립니다.' },
          { title: '생태 배송', desc: '친환경 포장재를 사용하여 배송합니다.' },
        ]}
        reviewCount={product.reviewCount}
        averageRating={product.rating}
        ratingBreakdown={MOCK_RATING_BREAKDOWN}
        reviews={MOCK_REVIEWS}
      />
    </div>
  );
}

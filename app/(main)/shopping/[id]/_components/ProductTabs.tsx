'use client';

import { useState } from 'react';
import ReviewSection, { Review } from '@/components/common/ReviewSection';
import { ProductInfoTab } from './ProductInfoTab';
import { DeliveryTab } from './DeliveryTab';
import { QnaTab } from './QnaTab';

const TABS = ['상품 정보', '리뷰', '배송·교환', '상품 문의'] as const;
type Tab = (typeof TABS)[number];

interface ProductTabsProps {
  descriptionTitle: string;
  description: string;
  descriptionImageUrl?: string;
  features: { title: string; desc: string }[];
  reviewCount: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Review[];
}

export default function ProductTabs({
  descriptionTitle, description, descriptionImageUrl, features,
  reviewCount, averageRating, ratingBreakdown, reviews,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('상품 정보');

  return (
    <div className="mt-10">
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-text hover:text-dark-text'
            }`}
          >
            {tab}
            {tab === '리뷰' && reviewCount > 0 && (
              <span className="ml-1 text-xs text-muted">({reviewCount})</span>
            )}
          </button>
        ))}
      </div>
      <div className="py-8">
        {activeTab === '상품 정보' && (
          <ProductInfoTab
            title={descriptionTitle} description={description} imageUrl={descriptionImageUrl}
            features={features} reviews={reviews} reviewCount={reviewCount}
            averageRating={averageRating} ratingBreakdown={ratingBreakdown}
            onViewAllReviews={() => setActiveTab('리뷰')}
          />
        )}
        {activeTab === '리뷰' && (
          <ReviewSection
            averageRating={averageRating} totalCount={reviewCount}
            ratingBreakdown={ratingBreakdown} reviews={reviews}
          />
        )}
        {activeTab === '배송·교환' && <DeliveryTab />}
        {activeTab === '상품 문의' && <QnaTab />}
      </div>
    </div>
  );
}

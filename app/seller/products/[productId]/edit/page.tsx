'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/app/seller/components/ProductForm';
import api from '@/lib/api';
import type { ProductFormData } from '@/types/seller/product';

export default function ProductEditPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;

  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/seller/products/${productId}`)
      .then(({ data }) => {
        if (cancelled) return;

        const { product, subImages } = data.data;

        const mapped: ProductFormData = {
          productId: product.product_id,
          basicInfo: {
            parentCategoryId: String(product.categories?.parent_id ?? ''),
            categoryId: String(product.category_id ?? ''),
            name: product.name,
            brand: product.brand ?? '',
            origin: product.origin,
            status: product.status,
          },
          pricingInfo: {
            price: String(product.price),
            stock: String(product.stock),
            discountType: product.discount_type ?? 'none',
            discountValue: product.discount_value != null ? String(product.discount_value) : '',
          },
          images: {
            images: [
              {
                id: crypto.randomUUID(),
                preview: product.image,
                // 대표이미지는 product_images 테이블 행이 아니라 products.image 컬럼이라 imageId 없음
              },
              ...subImages.map((img: { image_id: number; url: string }) => ({
                id: crypto.randomUUID(),
                imageId: img.image_id,
                preview: img.url,
              })),
            ],
          },
          description: { content: product.description ?? '' },
          shippingTemplateId: product.shipping_template_id,
          returnPolicyTemplateId: product.return_policy_template_id,
        };

        setInitialData(mapped);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '상품 정보를 불러오지 못했습니다.');
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (error) {
    return (
      <div className="bg-background p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="bg-background p-8">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text">상품 수정</h1>
      </div>
      <ProductForm mode="edit" initialData={initialData} />
    </div>
  );
}

'use client';

import { useState } from 'react';
import BasicInfoField from './BasicInfoField';
import PricingField from './PricingField';
import ImageUploadField from './ImageUploadField';
import DescriptionEditor from './DescriptionEditor';
import ShippingSection from './ShippingSection';
import FormActionButtons from './FormActionButtons';
import type { ProductFormData, ProductFormProps } from '@/types/seller/product';
import { initialProductForm } from '@/types/seller/product';
import ProductInfoField from './ProductInfoField';
import ReturnPolicyField from './ReturnPolicyField';

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(initialData ?? initialProductForm);

  const handleChange = <S extends keyof ProductFormData, K extends keyof ProductFormData[S]>(
    section: S,
    field: K,
    value: ProductFormData[S][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = () => {
    if (
      !form.basicInfo.name ||
      !form.basicInfo.category ||
      !form.pricingInfo.price ||
      !form.pricingInfo.stock
    ) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (mode === 'create') {
      console.log('등록할 상품 데이터:', form);
      // TODO: API 연동
    } else {
      console.log('수정할 상품 데이터:', form);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BasicInfoField
        data={form.basicInfo}
        onChange={(field, value) => handleChange('basicInfo', field, value)}
      />
      <ImageUploadField
        data={form.images}
        onChange={(images) =>
          setForm((prev) => ({
            ...prev,
            images: { images },
          }))
        }
      />
      <DescriptionEditor
        data={form.description}
        onChange={(content) =>
          setForm((prev) => ({
            ...prev,
            description: { content },
          }))
        }
      />
      <PricingField
        data={form.pricingInfo}
        onChange={(field, value) => handleChange('pricingInfo', field, value)}
      />
      <ShippingSection
        data={form.shippingInfo}
        onChange={(field, value) => handleChange('shippingInfo', field, value)}
      />
      <ProductInfoField
        data={form.productInfo}
        onChange={(field, value) => handleChange('productInfo', field, value)}
      />
      <ReturnPolicyField
        data={form.returnPolicy}
        onChange={(field, value) => handleChange('returnPolicy', field, value)}
      />
      <FormActionButtons mode={mode} onSubmit={handleSubmit} />
    </div>
  );
}

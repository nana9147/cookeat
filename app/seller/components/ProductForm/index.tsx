'use client';

import { useState } from 'react';
import BasicInfoField from './BasicInfoField';
import PricingField from './PricingField';
import ImageUploadField from './ImageUploadField';
import DescriptionEditor from './DescriptionEditor';
import ShippingSection from './ShippingSection';
import FormActionButtons from './FormActionButtons';
import type { ProductFormData } from '@/types/seller/product';
import { initialProductForm } from '@/types/seller/product';
import ProductInfoField from './ProductInfoField';

export default function ProductForm() {
  const [form, setForm] = useState<ProductFormData>(initialProductForm);

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
    console.log('등록할 상품 데이터:', form);
    // TODO: API 연동
  };

  return (
    <div className="flex flex-col gap-4">
      <BasicInfoField
        data={form.basicInfo}
        onChange={(field, value) => handleChange('basicInfo', field, value)}
      />
      <ImageUploadField />
      <DescriptionEditor />
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
      <FormActionButtons onSubmit={handleSubmit} />
    </div>
  );
}

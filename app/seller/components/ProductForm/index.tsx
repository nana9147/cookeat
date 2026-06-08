'use client';

import { useState } from 'react';
import BasicInfoField from './BasicInfoField';
import PricingField from './PricingField';
import FormActionButtons from './FormActionButtons';
import type { ProductFormData } from '@/types/seller/product';
import { initialProductForm } from '@/types/seller/product';
import ImageUploadField from './ImageUploadField';
import DescriptionEditor from './DescriptionEditor';

export default function ProductForm() {
  const [form, setForm] = useState<ProductFormData>(initialProductForm);

  const handleChange = (field: keyof ProductFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    console.log('등록할 상품 데이터:', form);
    // TODO: API 연동
  };

  return (
    <div className="flex flex-col gap-4">
      <BasicInfoField
        name={form.name}
        category={form.category}
        manufacturer={form.manufacturer}
        origin={form.origin}
        onNameChange={handleChange('name')}
        onCategoryChange={handleChange('category')}
        onManufacturerChange={handleChange('manufacturer')}
        onOriginChange={handleChange('origin')}
      />
      <PricingField
        price={form.price}
        stock={form.stock}
        discountType={form.discountType}
        discountValue={form.discountValue}
        minQuantity={form.minQuantity}
        maxQuantity={form.maxQuantity}
        onPriceChange={handleChange('price')}
        onStockChange={handleChange('stock')}
        onDiscountTypeChange={(v) => setForm((prev) => ({ ...prev, discountType: v }))}
        onDiscountValueChange={handleChange('discountValue')}
        onMinQuantityChange={handleChange('minQuantity')}
        onMaxQuantityChange={handleChange('maxQuantity')}
      />
      <ImageUploadField />
      <DescriptionEditor />
      <FormActionButtons onSubmit={handleSubmit} />
    </div>
  );
}

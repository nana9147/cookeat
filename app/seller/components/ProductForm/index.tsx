'use client';

import { useEffect, useState } from 'react';
import BasicInfoField from './BasicInfoField';
import PricingField from './PricingField';
import ImageUploadField from './ImageUploadField';
import DescriptionEditor from './DescriptionEditor';
import ShippingSection from './ShippingSection';
import FormActionButtons from './FormActionButtons';
import type { CategoryNode, ProductFormData, ProductFormProps } from '@/types/seller/product';
import { initialProductForm } from '@/types/seller/product';
import ProductInfoField from './ProductInfoField';
import ReturnPolicyField from './ReturnPolicyField';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ReturnPolicyTemplateOption, ShippingTemplateOption } from '@/types/seller/shipping';

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [form, setForm] = useState<ProductFormData>(initialData ?? initialProductForm);
  const [shippingTemplates, setShippingTemplates] = useState<ShippingTemplateOption[]>([]);
  const [returnPolicyTemplates, setReturnPolicyTemplates] = useState<ReturnPolicyTemplateOption[]>(
    []
  );

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data));
    api.get('/seller/shipping-templates').then(({ data }) => setShippingTemplates(data.data));
    api
      .get('/seller/return-policy-templates')
      .then(({ data }) => setReturnPolicyTemplates(data.data));
  }, []);

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

  const handleSubmit = async () => {
    if (
      !form.basicInfo.name ||
      !form.basicInfo.parentCategoryId ||
      !form.basicInfo.categoryId ||
      !form.pricingInfo.price ||
      !form.pricingInfo.stock
    ) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const [representativeImage, ...subImages] = form.images.images;

    const formData = new FormData();
    formData.append('name', form.basicInfo.name);
    formData.append('brand', form.basicInfo.brand);
    formData.append('origin', form.basicInfo.origin);
    formData.append('categoryId', form.basicInfo.categoryId);
    formData.append('status', form.basicInfo.status);
    formData.append('price', form.pricingInfo.price);
    formData.append('stock', form.pricingInfo.stock);
    formData.append('description', form.description.content);
    formData.append('discountType', form.pricingInfo.discountType);
    formData.append('discountValue', form.pricingInfo.discountValue);
    formData.append('minQuantity', form.pricingInfo.minQuantity);
    formData.append('maxQuantity', form.pricingInfo.maxQuantity);

    if (representativeImage?.file) {
      formData.append('image', representativeImage.file);
    }
    subImages.forEach((img) => {
      if (img.file) {
        formData.append('subImages', img.file);
      }
    });

    if (form.shippingTemplateId !== null) {
      formData.append('shippingTemplateId', String(form.shippingTemplateId));
    }
    if (form.returnPolicyTemplateId !== null) {
      formData.append('returnPolicyTemplateId', String(form.returnPolicyTemplateId));
    }

    try {
      if (mode === 'create') {
        await api.post('/seller/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('상품이 등록되었습니다.');
        router.push('/seller/products');
      } else {
        toast.success('나중에 수정하자');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BasicInfoField
        data={form.basicInfo}
        categories={categories}
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
        templates={shippingTemplates}
        value={form.shippingTemplateId}
        onChange={(templateId) => setForm((prev) => ({ ...prev, shippingTemplateId: templateId }))}
      />
      {/* <ProductInfoField
        data={form.productInfo}
        onChange={(field, value) => handleChange('productInfo', field, value)}
      /> */}
      <ReturnPolicyField
        templates={returnPolicyTemplates}
        value={form.returnPolicyTemplateId}
        onChange={(templateId) =>
          setForm((prev) => ({ ...prev, returnPolicyTemplateId: templateId }))
        }
      />
      <FormActionButtons mode={mode} onSubmit={handleSubmit} />
    </div>
  );
}

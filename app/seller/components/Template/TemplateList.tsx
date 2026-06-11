'use client';

import { Button } from '@/components/ui/button';
import { FormType, ShippingTemplate } from '@/types/seller/shipping';
import { Plus, TextSearch } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import ShippingTemplateTable from './ShippingTemplateTable';
import ShippingTemplateForm from './ShippingTemplateForm';

const MOCK_ShIPPING_TEMPLATES: ShippingTemplate[] = [
  {
    id: 't1',
    name: '기본 배송',
    feeType: '유료',
    fee: 3000,
    freeThreshold: 0,
    returnFee: 3000,
    originAddress: '(06234) 서울시 강남구 테헤란로 123 4층',
    returnAddress: '',
    isDefault: true,
  },
  {
    id: 't2',
    name: '무료배송',
    feeType: '무료',
    fee: 0,
    freeThreshold: 0,
    returnFee: 3000,
    originAddress: '(06234) 서울시 강남구 테헤란로 123 4층',
    returnAddress: '',
    isDefault: false,
  },
  {
    id: 't3',
    name: '5만원 이상 무료',
    feeType: '조건부 무료',
    fee: 3000,
    freeThreshold: 50000,
    returnFee: 3000,
    originAddress: '(17384) 경기도 이천시 물류로 456 창고동',
    returnAddress: '',
    isDefault: false,
  },
];

export default function TemplateList() {
  const [shippingTemplate, setShippingTemplate] =
    useState<ShippingTemplate[]>(MOCK_ShIPPING_TEMPLATES);
  const [isOpen, setIsOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormType>('등록');
  const [selectedTemplate, setSelectedTemplate] = useState<ShippingTemplate | undefined>(undefined);

  const handleSetDefault = (id: string) => {
    setShippingTemplate((prev) => prev.map((t) => ({ ...t, isDefault: t.id === id })));
  };

  const handleSubmit = (form: Omit<ShippingTemplate, 'id'>) => {
    if (formMode === '등록') {
      const newTemplate = { ...form, id: String(Date.now()) };
      setShippingTemplate((prev) =>
        prev.map((a) => (form.isDefault ? { ...a, isDefault: false } : a)).concat(newTemplate)
      );
    } else {
      setShippingTemplate((prev) =>
        prev.map((a) => {
          if (a.id === selectedTemplate?.id) return { ...a, ...form };
          if (form.isDefault) return { ...a, isDefault: false };
          return a;
        })
      );
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setShippingTemplate((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white border border-border rounded-lg p-5 mb-5">
        <div>
          <p className="text-h4 font-medium">배송 템플릿</p>
          <span className="text-sm text-light-gray">
            자주 쓰는 배송 정보를 저장해두고 상품 등록 시 바로 불러오세요.
          </span>
        </div>
        <Button
          variant="outline"
          className="p-5"
          onClick={() => {
            setFormMode('등록');
            setSelectedTemplate(undefined);
            setIsOpen(true);
          }}
        >
          <Plus />
          템플릿 추가
        </Button>
      </div>
      <Tabs defaultValue="shipping">
        <div className="flex items-center justify-between mb-4 border-b border-border">
          <TabsList variant={'line'}>
            <TabsTrigger
              value="shipping"
              className="p-3 after:bg-primary data-active:text-emerald-500"
            >
              배송 템플릿
            </TabsTrigger>
            <TabsTrigger
              value="return"
              className="p-3 after:bg-primary data-active:text-emerald-500"
            >
              반품규정 템플릿
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="shipping">
          {shippingTemplate.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <TextSearch className="mb-4 size-10 text-muted-foreground" />

              <p className="mb-1 text-sm font-medium text-foreground">
                등록된 배송 템플릿이 없습니다.
              </p>

              <p className="text-sm text-muted-foreground">배송 템플릿을 추가해보세요</p>
            </div>
          ) : (
            <ShippingTemplateTable
              shippings={shippingTemplate} // ← 복수
              onEdit={(shipping) => {
                setFormMode('수정');
                setSelectedTemplate(shipping);
                setIsOpen(true);
              }}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          )}
        </TabsContent>
        <TabsContent value="return"></TabsContent>
      </Tabs>
      <ShippingTemplateForm
        mode={formMode}
        template={selectedTemplate}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

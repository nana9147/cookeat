'use client';

import { Button } from '@/components/ui/button';
import { FormType, ShippingTemplate, ReturnPolicy } from '@/types/seller/shipping';
import { Plus, TextSearch } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import ShippingTemplateTable from './ShippingTemplateTable';
import ShippingTemplateForm from './ShippingTemplateForm';
import ReturnPolicyTable from './ReturnPolicyTable';
import ReturnPolicyForm from './ReturnPolicyForm';
import api from '@/lib/api';
import { toast } from 'sonner';

const MOCK_ShIPPING_TEMPLATES: ShippingTemplate[] = [
  {
    templateId: 1,
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
    templateId: 2,
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
    templateId: 3,
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

const MOCK_RETURN_POLICIES: ReturnPolicy[] = [
  {
    returnId: 1,
    name: '기본 반품 정책',
    content: {
      returnPeriod: 7,
      defectShippingPayer: '판매자',
      nonReturnReasons: [],
      refundPeriod: 3,
    },
    isDefault: true,
  },
  {
    returnId: 2,
    name: '신선식품 반품 정책',
    content: {
      returnPeriod: 7,
      defectShippingPayer: '판매자',
      nonReturnReasons: ['신선식품 단순 변심', '개봉/사용/설치 완료'],
      refundPeriod: 5,
    },
    isDefault: false,
  },
  {
    returnId: 3,
    name: '가공식품 반품 정책',
    content: {
      returnPeriod: 14,
      defectShippingPayer: '판매자',
      nonReturnReasons: ['개봉/사용/설치 완료'],
      refundPeriod: 7,
    },
    isDefault: false,
  },
];

export default function TemplateList() {
  const [activeTab, setActiveTab] = useState<'shipping' | 'return'>('shipping');
  const [isShippingFormOpen, setIsShippingFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);

  const [shippingTemplate, setShippingTemplate] =
    useState<ShippingTemplate[]>(MOCK_ShIPPING_TEMPLATES);
  const [returnTemplate, setReturnTemplate] = useState<ReturnPolicy[]>(MOCK_RETURN_POLICIES);

  const [formMode, setFormMode] = useState<FormType>('등록');
  const [selectedShipping, setSelectedShipping] = useState<ShippingTemplate | undefined>(undefined);
  const [selectedReturn, setSelectedReturn] = useState<ReturnPolicy | undefined>(undefined);

  //shipping
  const fetchShippingTemplates = () => {
    api
      .get('/seller/shipping/templates')
      .then(({ data }) => setShippingTemplate(data.data))
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : '배송 템플릿을 불러오지 못했습니다.')
      );
  };

  useEffect(() => {
    let cancelled = false;

    api
      .get('/seller/shipping/templates')
      .then(({ data }) => {
        if (!cancelled) setShippingTemplate(data.data);
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : '배송 템플릿을 불러오지 못했습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleShippingSetDefault = async (templateId: number) => {
    try {
      await api.patch(`/seller/shipping/templates/${templateId}/default`);
      toast.success('기본 템플릿이 변경되었습니다.');
      fetchShippingTemplates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '기본 템플릿 설정에 실패했습니다.');
    }
  };

  const handleShippingSubmit = async (form: Omit<ShippingTemplate, 'templateId'>) => {
    try {
      if (formMode === '등록') {
        await api.post('/seller/shipping/templates', form);
        toast.success('배송 템플릿이 등록되었습니다.');
      } else if (selectedShipping) {
        await api.patch(`/seller/shipping/templates/${selectedShipping.templateId}`, form);
        toast.success('배송 템플릿이 수정되었습니다.');
      }
      setIsShippingFormOpen(false);
      fetchShippingTemplates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '배송 템플릿 처리에 실패했습니다.');
    }
  };

  const handleShippingDelete = async (templateId: number) => {
    try {
      const { data } = await api.delete(`/seller/shipping/templates/${templateId}`);
      if (data.data?.newDefaultTemplateId) {
        toast.success('템플릿이 삭제되었고, 기본 템플릿이 변경되었습니다.');
      } else {
        toast.success('템플릿이 삭제되었습니다.');
      }
      fetchShippingTemplates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '배송 템플릿 삭제에 실패했습니다.');
    }
  };

  // return
  const handleReturnSetDefault = (id: string) => {
    setReturnTemplate((prev) => prev.map((t) => ({ ...t, isDefault: t.id === id })));
  };

  const handleReturnSubmit = (form: Omit<ReturnPolicy, 'id'>) => {
    if (formMode === '등록') {
      const newPolicy = { ...form, id: String(Date.now()) };
      setReturnTemplate((prev) =>
        prev.map((a) => (form.isDefault ? { ...a, isDefault: false } : a)).concat(newPolicy)
      );
    } else {
      setReturnTemplate((prev) =>
        prev.map((a) => {
          if (a.id === selectedReturn?.id) return { ...a, ...form };
          if (form.isDefault) return { ...a, isDefault: false };
          return a;
        })
      );
    }
    setIsReturnFormOpen(false);
  };

  const handleReturnDelete = (id: string) => {
    setReturnTemplate((prev) => prev.filter((a) => a.id !== id));
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
          onClick={() => {
            setFormMode('등록');
            if (activeTab === 'shipping') {
              setSelectedShipping(undefined);
              setIsShippingFormOpen(true);
            } else {
              setSelectedReturn(undefined);
              setIsReturnFormOpen(true);
            }
          }}
        >
          <Plus />
          {activeTab === 'shipping' ? '배송 템플릿 추가' : '반품규정 템플릿 추가'}
        </Button>
      </div>

      <Tabs defaultValue="shipping" onValueChange={(v) => setActiveTab(v as 'shipping' | 'return')}>
        <div className="flex items-center justify-between mb-4 border-b border-border">
          <TabsList variant="line">
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
              shippings={shippingTemplate}
              onEdit={(shipping) => {
                setFormMode('수정');
                setSelectedShipping(shipping);
                setIsShippingFormOpen(true);
              }}
              onDelete={handleShippingDelete}
              onSetDefault={handleShippingSetDefault}
            />
          )}
        </TabsContent>

        <TabsContent value="return">
          {returnTemplate.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <TextSearch className="mb-4 size-10 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium text-foreground">
                등록된 교환/환불 규정 템플릿이 없습니다.
              </p>
              <p className="text-sm text-muted-foreground">교환/환불 규정 템플릿을 추가해보세요</p>
            </div>
          ) : (
            <ReturnPolicyTable
              policies={returnTemplate}
              onEdit={(policy) => {
                setFormMode('수정');
                setSelectedReturn(policy);
                setIsReturnFormOpen(true);
              }}
              onDelete={handleReturnDelete}
              onSetDefault={handleReturnSetDefault}
            />
          )}
        </TabsContent>
      </Tabs>

      <ShippingTemplateForm
        mode={formMode}
        template={selectedShipping}
        isOpen={isShippingFormOpen}
        onClose={() => setIsShippingFormOpen(false)}
        onSubmit={handleShippingSubmit}
      />
      <ReturnPolicyForm
        mode={formMode}
        policy={selectedReturn}
        isOpen={isReturnFormOpen}
        onClose={() => setIsReturnFormOpen(false)}
        onSubmit={handleReturnSubmit}
      />
    </>
  );
}

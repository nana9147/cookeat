'use client';

import { Button } from '@/components/ui/button';
import { FormType, ShippingTemplate, ReturnPolicy, NonReturnReason } from '@/types/seller/shipping';
import { Plus, TextSearch } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import ShippingTemplateTable from './ShippingTemplateTable';
import ShippingTemplateForm from './ShippingTemplateForm';
import ReturnPolicyTable from './ReturnPolicyTable';
import ReturnPolicyForm from './ReturnPolicyForm';
import api from '@/lib/api';
import { toast } from 'sonner';

function mapReturnPolicyResponse(t: {
  templateId: number;
  name: string;
  returnPeriod: number;
  refundPeriod: number;
  nonReturnReasons: NonReturnReason[];
  isDefault: boolean;
}): ReturnPolicy {
  return {
    returnId: t.templateId,
    name: t.name,
    content: {
      returnPeriod: t.returnPeriod,
      defectShippingPayer: '판매자',
      nonReturnReasons: t.nonReturnReasons,
      refundPeriod: t.refundPeriod,
    },
    isDefault: t.isDefault,
  };
}

export default function TemplateList() {
  const [activeTab, setActiveTab] = useState<'shipping' | 'return'>('shipping');
  const [isShippingFormOpen, setIsShippingFormOpen] = useState(false);
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);

  const [shippingTemplate, setShippingTemplate] = useState<ShippingTemplate[]>([]);
  const [returnTemplate, setReturnTemplate] = useState<ReturnPolicy[]>([]);

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
  const fetchReturnPolicies = () => {
    api
      .get('/seller/return-policy/templates')
      .then(({ data }) => setReturnTemplate(data.data.map(mapReturnPolicyResponse)))
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : '반품정책 템플릿을 불러오지 못했습니다.')
      );
  };

  useEffect(() => {
    let cancelled = false;

    api
      .get('/seller/return-policy/templates')
      .then(({ data }) => {
        if (!cancelled) setReturnTemplate(data.data.map(mapReturnPolicyResponse));
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : '반품정책 템플릿을 불러오지 못했습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReturnSetDefault = async (returnId: number) => {
    try {
      await api.patch(`/seller/return-policy/templates/${returnId}/default`);
      toast.success('기본 템플릿이 변경되었습니다.');
      fetchReturnPolicies();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '기본 템플릿 설정에 실패했습니다.');
    }
  };

  const handleReturnSubmit = async (form: Omit<ReturnPolicy, 'returnId'>) => {
    try {
      const payload = {
        name: form.name,
        returnPeriod: form.content.returnPeriod,
        refundPeriod: form.content.refundPeriod,
        nonReturnReasons: form.content.nonReturnReasons,
        isDefault: form.isDefault,
      };

      if (formMode === '등록') {
        await api.post('/seller/return-policy/templates', payload);
        toast.success('반품정책 템플릿이 등록되었습니다.');
      } else if (selectedReturn) {
        await api.patch(`/seller/return-policy/templates/${selectedReturn.returnId}`, payload);
        toast.success('반품정책 템플릿이 수정되었습니다.');
      }
      setIsReturnFormOpen(false);
      fetchReturnPolicies();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '반품정책 템플릿 처리에 실패했습니다.');
    }
  };

  const handleReturnDelete = async (returnId: number) => {
    try {
      const { data } = await api.delete(`/seller/return-policy/templates/${returnId}`);
      if (data.data?.newDefaultTemplateId) {
        toast.success('템플릿이 삭제되었고, 기본 템플릿이 변경되었습니다.');
      } else {
        toast.success('템플릿이 삭제되었습니다.');
      }
      fetchReturnPolicies();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '반품정책 템플릿 삭제에 실패했습니다.');
    }
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

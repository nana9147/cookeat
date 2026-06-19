'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ShippingSectionProps } from '@/types/seller/shipping';

export default function ShippingSection({ templates, value, onChange }: ShippingSectionProps) {
  const [openModal, setOpenModal] = useState(false);

  const selectedTemplate = templates.find((t) => t.templateId === value) ?? null;

  const handleSelect = (templateId: number) => {
    onChange(templateId);
    setOpenModal(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            배송 정보
            {selectedTemplate && (
              <span className="text-xs text-green-700 font-normal bg-green-50 px-2 py-1 rounded-md border border-green-200">
                {selectedTemplate.name} 적용됨
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-5">
          <Button type="button" variant="outline" onClick={() => setOpenModal(true)}>
            배송 템플릿 선택
          </Button>

          {selectedTemplate ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm bg-gray-50 rounded-md p-4">
              <dt className="text-gray-500">배송비 유형</dt>
              <dd className="text-gray-800">{selectedTemplate.feeType}</dd>

              <dt className="text-gray-500">배송비</dt>
              <dd className="text-gray-800">
                {selectedTemplate.fee.toLocaleString()}원
                {selectedTemplate.feeType === '조건부 무료' &&
                  selectedTemplate.freeThreshold !== null &&
                  ` (${selectedTemplate.freeThreshold.toLocaleString()}원 이상 무료)`}
              </dd>

              <dt className="text-gray-500">반품/교환 배송비</dt>
              <dd className="text-gray-800">{selectedTemplate.returnFee.toLocaleString()}원</dd>

              <dt className="text-gray-500">출고지</dt>
              <dd className="text-gray-800">{selectedTemplate.originAddress}</dd>

              <dt className="text-gray-500">반품/교환지</dt>
              <dd className="text-gray-800">{selectedTemplate.returnAddress}</dd>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">
              아직 선택된 배송 템플릿이 없어요. 배송 템플릿을 선택해주세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 템플릿 선택 모달 */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배송 템플릿 선택</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                등록된 배송 템플릿이 없어요. 배송 관리에서 먼저 만들어주세요.
              </p>
            ) : (
              templates.map((t) => (
                <button
                  key={t.templateId}
                  type="button"
                  onClick={() => handleSelect(t.templateId)}
                  className="flex flex-col items-start gap-1 px-4 py-3 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    {t.name}
                    {t.isDefault && (
                      <span className="text-2xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                        기본
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.feeType} · {t.fee.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-400">{t.originAddress}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ReturnPolicyFieldProps } from '@/types/seller/shipping';

export default function ReturnPolicyField({ templates, value, onChange }: ReturnPolicyFieldProps) {
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
            반품 정책
            {selectedTemplate && (
              <span className="text-xs text-green-700 font-normal bg-green-50 px-2 py-1 rounded-md border border-green-200">
                {selectedTemplate.name} 적용됨
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-5">
          <Button type="button" variant="outline" onClick={() => setOpenModal(true)}>
            반품 정책 템플릿 선택
          </Button>

          {selectedTemplate ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm bg-gray-50 rounded-md p-4">
              <dt className="text-gray-500">반품 가능 기간</dt>
              <dd className="text-gray-800">{selectedTemplate.returnPeriod}일</dd>

              <dt className="text-gray-500">환불 처리 기간</dt>
              <dd className="text-gray-800">{selectedTemplate.refundPeriod}일</dd>

              <dt className="text-gray-500">반품 불가 사유</dt>
              <dd className="text-gray-800">
                {selectedTemplate.nonReturnReasons.length > 0
                  ? selectedTemplate.nonReturnReasons.join(', ')
                  : '없음'}
              </dd>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">
              아직 선택된 반품 정책 템플릿이 없어요. 반품 정책 템플릿을 선택해주세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 템플릿 선택 모달 */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반품 정책 템플릿 선택</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                등록된 반품 정책 템플릿이 없어요. 배송 관리에서 먼저 만들어주세요.
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
                    반품 {t.returnPeriod}일 · 환불 {t.refundPeriod}일
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

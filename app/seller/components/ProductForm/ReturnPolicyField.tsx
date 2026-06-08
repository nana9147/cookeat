'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ReturnPolicyFieldProps } from '@/types/seller/product';
import { useState } from 'react';

// TODO: API로 교체
const MOCK_RETURNPOLICY = [
  {
    id: '1',
    name: '기본 반품 정책',
    content: `수령 후 7일 이내 반품/교환 가능합니다.

- 단순 변심: 반품 배송비 고객 부담
- 상품 불량/오배송: 반품 배송비 판매자 부담
- 신선도 문제: 수령 당일 사진 첨부 후 고객센터 문의`,
  },
  {
    id: '2',
    name: '신선식품 반품 정책',
    content: `신선식품 특성상 단순 변심에 의한 반품/교환이 불가합니다.

- 상품 불량/오배송: 수령 후 24시간 이내 사진 첨부 후 고객센터 문의
- 배송 중 파손: 수령 즉시 사진 첨부 후 고객센터 문의
- 냉장/냉동 상품: 수령 후 즉시 보관 요망`,
  },
  {
    id: '3',
    name: '가공식품 반품 정책',
    content: `수령 후 7일 이내 반품/교환 가능합니다.

- 단순 변심: 미개봉 상태에 한해 반품 가능, 반품 배송비 고객 부담
- 상품 불량: 반품 배송비 판매자 부담
- 개봉 후 단순 변심: 반품/교환 불가`,
  },
];

export default function ReturnPolicyField({ data, onChange }: ReturnPolicyFieldProps) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectReturnPolicy = (item: (typeof MOCK_RETURNPOLICY)[0]) => {
    onChange('content', item.content);
    setSelectedTemplate(item.name);
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
                {selectedTemplate} 적용됨
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-5">
          <Button type="button" onClick={() => setOpenModal(true)}>
            반품정책 템플릿
          </Button>
          <Textarea
            value={data.content}
            onChange={(e) => onChange('content', e.target.value)}
            placeholder="반품 정책을 입력하세요"
            rows={6}
          />
        </CardContent>
      </Card>

      {/* 템플릿 모달 */}
      <Dialog open={openModal} onOpenChange={(open) => !open && setOpenModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반품정책</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {MOCK_RETURNPOLICY.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectReturnPolicy(item)}
                className="flex flex-col items-start gap-1 px-4 py-3 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-500">{item.content}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

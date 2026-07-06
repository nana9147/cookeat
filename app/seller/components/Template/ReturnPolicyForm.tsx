'use client';

import { NonReturnReason, ReturnPolicy, ReturnPolicyFormProps } from '@/types/seller/shipping';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const EMPTY_RETURN_POLICY: Omit<ReturnPolicy, 'returnId'> = {
  name: '',
  content: {
    returnPeriod: 7,
    defectShippingPayer: '판매자',
    nonReturnReasons: [],
    refundPeriod: 3,
  },
  isDefault: false,
};

const NON_RETURN_REASONS: NonReturnReason[] = [
  '신선식품 단순변심 반품불가',
  '포장 개봉/사용 후',
  '소비기한 경과',
  '보관방법 미준수로 인한 손상/변질',
  '주문제작(정육손질/소분 등)',
];

export default function ReturnPolicyForm({
  mode,
  policy,
  isOpen,
  onClose,
  onSubmit,
}: ReturnPolicyFormProps) {
  const [form, setForm] = useState<Omit<ReturnPolicy, 'returnId'>>(EMPTY_RETURN_POLICY);

  useEffect(() => {
    setForm(policy ?? EMPTY_RETURN_POLICY);
  }, [policy]);

  const updateContent = (fields: Partial<ReturnPolicy['content']>) => {
    setForm((prev) => ({ ...prev, content: { ...prev.content, ...fields } }));
  };

  const toggleNonReturnReason = (reason: NonReturnReason) => {
    const current = form.content.nonReturnReasons;
    updateContent({
      nonReturnReasons: current.includes(reason)
        ? current.filter((r) => r !== reason)
        : [...current, reason],
    });
  };

  const handleSubmit = () => {
    if (!form.name) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }
    if (!form.content.returnPeriod) {
      alert('반품 가능 기간을 입력해주세요.');
      return;
    }
    if (!form.content.refundPeriod) {
      alert('환불 처리 기간을 입력해주세요.');
      return;
    }

    onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === '등록' ? '새 반품규정 템플릿' : '반품규정 템플릿 수정'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* 템플릿 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              템플릿 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예) 기본 반품 정책, 신선식품 반품 정책"
            />
          </div>

          <Separator />

          {/* 반품 기간 */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-500">반품 기간</p>
            <div className="grid grid-cols-2 gap-4 max-mobile:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  반품 가능 기간 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.content.returnPeriod}
                    onChange={(e) => updateContent({ returnPeriod: Number(e.target.value) })}
                    min={7}
                    className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1.5 text-sm text-gray-400">일</span>
                </div>
                <p className="text-xs text-gray-400">수령일 기준, 최소 7일</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  환불 처리 기간 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.content.refundPeriod}
                    onChange={(e) => updateContent({ refundPeriod: Number(e.target.value) })}
                    min={1}
                    className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1.5 text-sm text-gray-400">일</span>
                </div>
                <p className="text-xs text-gray-400">반품 확인 후 기준</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 판매자 귀책 */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-500">판매자 귀책 (불량/오배송)</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">배송비 부담</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-500">
                판매자 부담 (자동 적용)
              </div>
            </div>
          </div>

          <Separator />

          {/* 반품 불가 사유 */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-500">반품 불가 사유</p>
            <div className="grid grid-cols-2 gap-2 max-mobile:grid-cols-1">
              {NON_RETURN_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 text-sm text-gray-700 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.content.nonReturnReasons.includes(reason)}
                    onChange={() => toggleNonReturnReason(reason)}
                    className="accent-green-600 w-4 h-4"
                  />
                  {reason}
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* 기본값 설정 */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-green-600 w-4 h-4"
            />
            이 템플릿을 기본값으로 설정
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>
            <Check size={15} /> 저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { ShippingFeeType, ShippingTemplateFormProps } from '@/types/seller/shipping';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

const fee_types: ShippingFeeType[] = ['무료', '유료', '조건부 무료'];
const MOCK_ADDRESSES = [
  {
    id: '1',
    name: '본사 창고',
    zipCode: '06234',
    baseAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '4층',
    type: '출고지',
  },
  {
    id: '2',
    name: '사무실',
    zipCode: '06234',
    baseAddress: '서울시 구로구 디지털로 123',
    detailAddress: '2층',
    type: '출고지',
  },
  {
    id: '3',
    name: '경기 물류센터',
    zipCode: '17384',
    baseAddress: '경기도 이천시 물류로 456',
    detailAddress: '창고동',
    type: '반품지',
  },
];

export default function ShippingTemplateForm({
  mode,
  template,
  isOpen,
  onClose,
  onSubmit,
}: ShippingTemplateFormProps) {
  const [openAddressModal, setOpenAddressModal] = useState<'origin' | 'return' | null>(null);

  const [form, setForm] = useState({
    name: '',
    feeType: '무료' as ShippingFeeType,
    fee: 0,
    freeThreshold: 0,
    returnFee: 0,
    originAddress: '',
    returnAddress: '',
    isDefault: false,
  });

  useEffect(() => {
    setForm({
      name: template?.name ?? '',
      feeType: template?.feeType ?? '무료',
      fee: template?.fee ?? 0,
      freeThreshold: template?.freeThreshold ?? 0,
      returnFee: template?.returnFee ?? 0,
      originAddress: template?.originAddress ?? '',
      returnAddress: template?.returnAddress ?? '',
      isDefault: template?.isDefault ?? false,
    });
  }, [template, isOpen]);

  const handleSubmit = () => {
    if (!form.name) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }
    if (form.feeType !== '무료' && !form.fee) {
      alert('배송비를 입력해주세요.');
      return;
    }
    if (form.feeType === '조건부 무료' && !form.freeThreshold) {
      alert('무료배송 기준금액을 입력해주세요.');
      return;
    }
    if (!form.returnFee) {
      alert('반품/교환 배송비를 입력해주세요.');
      return;
    }
    if (!form.originAddress) {
      alert('출고지 주소를 선택해주세요.');
      return;
    }
    if (!form.returnAddress) {
      alert('교환/반품 주소를 선택해주세요.');
      return;
    }
    onSubmit(form);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === '등록' ? '새 배송 템플릿' : '배송 템플릿 수정'}</DialogTitle>
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
                placeholder="예) 기본 배송, 냉장 배송"
              />
            </div>

            {/* 배송비 유형 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                배송비 유형 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {fee_types.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={form.feeType === type ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setForm({ ...form, feeType: type })}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* 유료 배송비 */}
            {form.feeType === '유료' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  기본 배송비<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                    className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                </div>
              </div>
            )}

            {/* 조건부 무료 */}
            {form.feeType === '조건부 무료' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    기본 배송비<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.fee}
                      onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                      placeholder="0"
                      min={0}
                      className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    무료배송 기준금액<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.freeThreshold}
                      onChange={(e) => setForm({ ...form, freeThreshold: Number(e.target.value) })}
                      placeholder="0"
                      min={0}
                      className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 반품/교환 배송비 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                반품/교환 배송비 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={form.returnFee}
                  onChange={(e) => setForm({ ...form, returnFee: Number(e.target.value) })}
                  placeholder="0"
                  min={0}
                  className="pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
              </div>
              <p className="text-xs text-gray-400">편도 기준 금액</p>
            </div>

            {/* 출고지 주소 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">
                  출고지 주소<span className="text-red-500">*</span>
                </label>
                <Button variant={'secondary'} onClick={() => setOpenAddressModal('origin')}>
                  출고지 목록보기
                </Button>
              </div>
              <Input
                value={form.originAddress}
                onChange={(e) => setForm({ ...form, originAddress: e.target.value })}
                placeholder="예) (06234) 서울시 강남구 테헤란로 123"
              />
            </div>

            {/* 반품/교환지 주소 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">
                  반품/교환지 주소<span className="text-red-500">*</span>
                </label>
                <Button variant={'secondary'} onClick={() => setOpenAddressModal('return')}>
                  반품지 목록보기
                </Button>
              </div>
              <Input
                value={form.returnAddress}
                onChange={(e) => setForm({ ...form, returnAddress: e.target.value })}
                placeholder="출고지와 동일하면 비워두세요"
              />
            </div>

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
      <Dialog open={openAddressModal !== null} onOpenChange={() => setOpenAddressModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {openAddressModal === 'origin' ? '출고지 선택' : '반품지 선택'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {MOCK_ADDRESSES.filter((a) =>
              openAddressModal === 'origin' ? a.type === '출고지' : a.type === '반품지'
            ).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  const fullAddress = `(${a.zipCode}) ${a.baseAddress} ${a.detailAddress}`;
                  if (openAddressModal === 'origin')
                    setForm({ ...form, originAddress: fullAddress });
                  else setForm({ ...form, returnAddress: fullAddress });
                  setOpenAddressModal(null);
                }}
                className="flex flex-col items-start gap-1 px-4 py-3 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-800">{a.name}</span>
                <span className="text-xs text-gray-400">
                  ({a.zipCode}) {a.baseAddress}
                </span>
                <span className="text-xs text-gray-500">{a.detailAddress}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

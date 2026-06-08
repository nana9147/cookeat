'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ShippingSectionProps } from '@/types/seller/shipping';

const DELIVERY_METHODS = ['택배', '직접배송', '퀵서비스', '방문수령'];
const SHIPPING_FEE_TYPES = ['무료', '유료', '조건부 무료'];

// TODO: API로 교체
const MOCK_ADDRESSES = [
  {
    id: '1',
    name: '본사 창고',
    zipCode: '06234',
    baseAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '4층',
  },
  {
    id: '2',
    name: '경기 물류센터',
    zipCode: '17384',
    baseAddress: '경기도 이천시 물류로 456',
    detailAddress: '창고동',
  },
  {
    id: '3',
    name: '부산 창고',
    zipCode: '48058',
    baseAddress: '부산시 해운대구 센텀로 789',
    detailAddress: 'B동',
  },
];

export default function ShippingField({
  deliveryMethod,
  shippingFee,
  returnFee,
  originAddress,
  returnAddress,
  onDeliveryMethodChange,
  onShippingFeeChange,
  onReturnFeeChange,
  onOriginAddressChange,
  onReturnAddressChange,
}: ShippingSectionProps) {
  const [feeType, setFeeType] = useState<'무료' | '유료' | '조건부 무료'>('유료');
  const [freeThreshold, setFreeThreshold] = useState('');
  const [openModal, setOpenModal] = useState<'origin' | 'return' | null>(null);

  const handleSelectAddress = (item: (typeof MOCK_ADDRESSES)[0]) => {
    const fullAddress = `(${item.zipCode}) ${item.baseAddress} ${item.detailAddress}`;
    if (openModal === 'origin') onOriginAddressChange(fullAddress);
    if (openModal === 'return') onReturnAddressChange(fullAddress);
    setOpenModal(null);
  };

  const handleFeeTypeChange = (type: '무료' | '유료' | '조건부 무료') => {
    setFeeType(type);
    if (type === '무료') onShippingFeeChange('0');
    else onShippingFeeChange('');
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>배송 정보</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-5">
          {/* 배송 방법 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배송 방법 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DELIVERY_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onDeliveryMethodChange(method)}
                  className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                    deliveryMethod === method
                      ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* 배송비 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배송비 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 items-center flex-wrap ">
              {/* 배송비 유형 select */}
              <select
                value={feeType}
                onChange={(e) =>
                  handleFeeTypeChange(e.target.value as '무료' | '유료' | '조건부 무료')
                }
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 "
              >
                {SHIPPING_FEE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {feeType === '유료' && (
                <div className="relative">
                  <Input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => onShippingFeeChange(e.target.value)}
                    placeholder="배송비를 입력하세요"
                    min={0}
                    className="w-48 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
                  />
                  <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                </div>
              )}

              {feeType === '조건부 무료' && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-24 shrink-0">기본 배송비</span>
                    <div className="relative">
                      <Input
                        type="number"
                        value={shippingFee}
                        onChange={(e) => onShippingFeeChange(e.target.value)}
                        placeholder="0"
                        min={0}
                        className="w-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
                      />
                      <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-24 shrink-0">무료배송 기준</span>
                    <div className="relative">
                      <Input
                        type="number"
                        value={freeThreshold}
                        onChange={(e) => setFreeThreshold(e.target.value)}
                        placeholder="0"
                        min={0}
                        className="w-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
                      />
                      <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
                    </div>
                    <span className="text-sm text-gray-500">이상 무료</span>
                  </div>
                </div>
              )}

              {feeType === '무료' && (
                <span className="text-sm text-green-700 font-medium">전체 무료배송</span>
              )}
            </div>
          </div>

          {/* 반품비 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              반품/교환 배송비 <span className="text-red-500">*</span>
            </label>
            <div className="relative w-48">
              <Input
                type="number"
                value={returnFee}
                onChange={(e) => onReturnFeeChange(e.target.value)}
                placeholder="0"
                min={0}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
              />
              <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">편도 기준 금액을 입력하세요</p>
          </div>

          {/* 출고지 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출고지 주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <Input
                value={originAddress}
                readOnly
                placeholder="출고지를 선택해주세요"
                className="cursor-pointer"
                onClick={() => setOpenModal('origin')}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenModal('origin')}
              >
                선택
              </Button>
            </div>
          </div>

          {/* 반품/교환지 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              반품/교환지 주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <Input
                value={returnAddress}
                readOnly
                placeholder="반품/교환지를 선택해주세요"
                className="cursor-pointer"
                onClick={() => setOpenModal('return')}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenModal('return')}
              >
                선택
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주소 선택 모달 */}
      <Dialog open={openModal !== null} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openModal === 'origin' ? '출고지 선택' : '반품/교환지 선택'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {MOCK_ADDRESSES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectAddress(item)}
                className="flex flex-col items-start gap-1 px-4 py-3 rounded-md border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-400">
                  ({item.zipCode}) {item.baseAddress}
                </span>
                <span className="text-xs text-gray-500">{item.detailAddress}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

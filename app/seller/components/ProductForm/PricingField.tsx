'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PricingFieldProps } from '@/types/seller/product';

export default function PricingField({ data, onChange }: PricingFieldProps) {
  const [showDiscount, setShowDiscount] = useState(false);

  const calcDiscountedPrice = () => {
    const p = Number(data.price?.replace(/,/g, '') || 0);
    const v = Number(data.discountValue?.replace(/,/g, '') || 0);
    if (!p || !v || data.discountType === 'none') return null;
    if (data.discountType === 'amount') return Math.max(0, p - v).toLocaleString();
    if (data.discountType === 'rate')
      return Math.max(0, Math.round(p * (1 - v / 100))).toLocaleString();
  };

  const discountedPrice = calcDiscountedPrice();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>판매 정보</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-5">
        {/* 판매가 + 재고 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              판매가 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                value={data.price}
                onChange={(e) => onChange('price', e.target.value)}
                placeholder="0"
                min={0}
                step={100}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
              />
              <span className="absolute right-3 top-1.5 text-sm text-gray-400">원</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              재고 수량 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={data.stock}
              onChange={(e) => onChange('stock', e.target.value)}
              placeholder="0"
              min={0}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <Separator />

        {/* 할인 설정 토글 */}
        <div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={showDiscount ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowDiscount(true);
                if (data.discountType === 'none') onChange('discountType', 'amount');
              }}
            >
              할인 설정
            </Button>
            <Button
              type="button"
              variant={!showDiscount ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowDiscount(false);
                onChange('discountType', 'none');
                onChange('discountValue', '');
              }}
            >
              할인 미설정
            </Button>
          </div>

          {showDiscount && (
            <div className="mt-4 flex flex-col gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              {/* 할인 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">할인 유형</label>
                <div className="flex gap-4">
                  {(['amount', 'rate'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="discountType"
                        value={type}
                        checked={data.discountType === type}
                        onChange={() => {
                          onChange('discountType', type);
                          onChange('discountValue', '');
                        }}
                        className="accent-green-600"
                      />
                      {type === 'amount' ? '정액 할인 (원)' : '정률 할인 (%)'}
                    </label>
                  ))}
                </div>
              </div>

              {/* 할인 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">할인 금액</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={data.discountValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const p = Number(data.price);
                      if (data.discountType === 'amount' && p && v > p) {
                        alert('할인 금액이 판매가보다 클 수 없어요.');
                        onChange('discountValue', '');
                        return;
                      }
                      if (data.discountType === 'rate' && v > 100) {
                        alert('할인율은 100%를 초과할 수 없어요.');
                        onChange('discountValue', '');
                        return;
                      }
                      onChange('discountValue', e.target.value);
                    }}
                    placeholder={!data.price ? '판매가를 먼저 입력해주세요' : '0'}
                    disabled={!data.price}
                    min={0}
                    max={data.discountType === 'rate' ? 100 : Number(data.price) || undefined}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-7"
                  />
                  <span className="absolute right-3 top-1.5 text-sm text-gray-400">
                    {data.discountType === 'rate' ? '%' : '원'}
                  </span>
                </div>
                {discountedPrice && (
                  <p className="text-sm text-green-700 mt-2 font-medium text-right">
                    할인 적용가: {discountedPrice}원
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* 최소/최대 구매 수량 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최소 구매 수량</label>
            <Input
              type="number"
              value={data.minQuantity}
              onChange={(e) => onChange('minQuantity', e.target.value)}
              placeholder="1"
              min={1}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최대 구매 수량</label>
            <Input
              type="number"
              value={data.maxQuantity}
              onChange={(e) => onChange('maxQuantity', e.target.value)}
              placeholder="제한 없음"
              min={1}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
